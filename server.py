import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
import cv2
import json
import base64
import joblib
import numpy as np
from PIL import Image, ImageOps
import io
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uuid
import shutil

from inference.predict_pose import process_image_array, MODEL_PATH, ENCODER_PATH, IDEAL_POSES_JSON, POSE_NAME_MAP
from inference.video_service import video_jobs, analyze_video_task, get_job_status, delete_job
from inference.chatbot_service import chatbot_status, check_services, query_chatbot

model = None
encoder = None
ideal_poses = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, encoder, ideal_poses
    print("Loading AI Models and Ideal Poses...")
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH) and os.path.exists(IDEAL_POSES_JSON):
        model = joblib.load(MODEL_PATH)
        encoder = joblib.load(ENCODER_PATH)
        with open(IDEAL_POSES_JSON, 'r') as f:
            ideal_poses = json.load(f)
        print(f"Successfully loaded model with classes: {list(encoder.classes_)}")
    else:
        print("Error: Models or Ideal Poses JSON missing!")
    
    # Check chatbot RAG services
    print("Checking Local RAG Chatbot services...")
    try:
        from inference.chatbot_service import rag_system
        rag_system.load_and_index()
    except Exception as e:
        print(f"Warning: Chatbot service setup failed: {e}")
        
    yield
    print("Shutting down server...")

app = FastAPI(title="Mallakhamb AI Backend Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FramePayload(BaseModel):
    image: str

class AnalyzePayload(BaseModel):
    videoId: str
    analysisFps: float = 3.0
    confidenceThreshold: float = 52.0
    windowSize: int = 3
    transitionThreshold: int = 2

class ChatbotPayload(BaseModel):
    question: str

def numpy_rgb_to_base64(image_rgb):
    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"

def decode_base64_to_cv2(b64_str):
    if ',' in b64_str:
        b64_str = b64_str.split(',')[1]
    image_data = base64.b64decode(b64_str)
    nparr = np.frombuffer(image_data, np.uint8)
    image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image_bgr

def format_prediction_response(result):
    annotated_b64 = numpy_rgb_to_base64(result["image"]) if "image" in result else None

    if "error" in result and "pose" not in result:
        return {
            "success": False,
            "error": result["error"],
            "data": {
                "poseName": "No Pose Detected",
                "confidence": 0.0,
                "accuracy": 0,
                "grade": "N/A",
                "feedback": [result["error"]],
                "corrections": ["Ensure full body is clearly visible in front of camera."],
                "image": annotated_b64,
                "personDetected": False,
                "poleDetected": True
            }
        }
    
    if result.get("unrecognized", False):
        return {
            "success": True,
            "data": {
                "poseName": result.get("pose", "Unrecognized Pose"),
                "confidence": float(result.get("confidence", 35.0)),
                "accuracy": float(result.get("accuracy", 0.0)),
                "grade": result.get("grade", "Needs Improvement"),
                "feedback": result.get("feedback", ["Posture not recognized as a valid Mallakhamb pose."]),
                "corrections": result.get("feedback", ["Please upload an image of a valid Mallakhamb posture."]),
                "image": annotated_b64,
                "personDetected": True,
                "poleDetected": bool(result.get("poleDetected", False))
            }
        }
    
    pose_name = result.get("pose", "Mallakhamb Pose")
    conf = float(result.get("confidence", 85.0))
    acc = float(result.get("accuracy", 82.0))
    feedback_list = result.get("feedback", ["Good posture alignment."])
    
    return {
        "success": True,
        "data": {
            "poseName": pose_name,
            "confidence": round(conf, 1),
            "accuracy": round(acc, 1),
            "grade": result.get("grade", "Good"),
            "feedback": feedback_list,
            "corrections": feedback_list,
            "image": annotated_b64,
            "personDetected": True,
            "poleDetected": bool(result.get("poleDetected", False))
        }
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "classes": list(encoder.classes_) if encoder is not None else []
    }

@app.post("/api/detect/image")
async def detect_image(image: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="AI Models are not loaded on server.")
        
    contents = await image.read()
    try:
        pil_img = Image.open(io.BytesIO(contents))
        pil_img = ImageOps.exif_transpose(pil_img)
        img_np = np.array(pil_img.convert("RGB"))
        image_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    result = process_image_array(image_bgr, model, encoder, ideal_poses, fast_mode=False)
    return format_prediction_response(result)

@app.post("/api/detect/frame")
async def detect_frame(payload: FramePayload):
    if model is None:
        raise HTTPException(status_code=500, detail="AI Models are not loaded on server.")
        
    try:
        image_bgr = decode_base64_to_cv2(payload.image)
        if image_bgr is None:
            raise ValueError("Failed to decode frame")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 frame: {e}")

    result = process_image_array(image_bgr, model, encoder, ideal_poses, fast_mode=True)
    return format_prediction_response(result)

@app.post("/api/video/upload")
async def upload_video(file: UploadFile = File(...)):
    # Validate file type
    allowed_extensions = {".mp4", ".mov", ".avi", ".webm"}
    filename = file.filename
    _, ext = os.path.splitext(filename.lower())
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported format. Allowed: {', '.join(allowed_extensions)}")
    
    # Validate file size (max 50MB)
    MAX_SIZE = 50 * 1024 * 1024  # 50MB
    file.file.seek(0, 2)
    size_bytes = file.file.tell()
    file.file.seek(0)
    
    if size_bytes > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Video exceeds maximum size of 50MB.")
    
    # Generate unique ID
    video_id = str(uuid.uuid4())
    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_videos")
    os.makedirs(temp_dir, exist_ok=True)
    
    filepath = os.path.join(temp_dir, f"{video_id}{ext}")
    
    # Save the file
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {e}")
        
    # Extract metadata using OpenCV
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=400, detail="Corrupted video or invalid format.")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / fps if fps > 0 else 0.0
    cap.release()
    
    # Initialize job in service store
    video_jobs[video_id] = {
        "status": "pending",
        "progress": 0,
        "stage": "idle",
        "filename": filename,
        "filepath": filepath,
        "duration": duration,
        "fps": fps,
        "totalFrames": total_frames,
        "sampledFrames": 0,
        "processedFrames": 0,
        "startTime": 0.0,
        "processingTime": 0.0,
        "error": None,
        "results": None
    }
    
    return {
        "success": True,
        "data": {
            "videoId": video_id,
            "filename": filename,
            "duration": round(duration, 1),
            "fps": round(fps, 1),
            "resolution": f"{width}x{height}",
            "sizeBytes": size_bytes
        }
    }

@app.post("/api/video/analyze")
def analyze_video(payload: AnalyzePayload, background_tasks: BackgroundTasks):
    video_id = payload.videoId
    job = get_job_status(video_id)
    if not job:
        raise HTTPException(status_code=404, detail="Video ID not found. Upload the video first.")
        
    # Prevent duplicate requests
    if job["status"] in ("processing", "completed") and job["error"] is None:
        return {
            "success": True,
            "message": "Video is already processing or has completed.",
            "videoId": video_id
        }
        
    # Trigger background task
    config = {
        "analysisFps": payload.analysisFps,
        "confidenceThreshold": payload.confidenceThreshold,
        "windowSize": payload.windowSize,
        "transitionThreshold": payload.transitionThreshold
    }
    
    background_tasks.add_task(
        analyze_video_task,
        video_id,
        job["filepath"],
        config,
        model,
        encoder,
        ideal_poses
    )
    
    return {
        "success": True,
        "message": "Analysis started in background.",
        "videoId": video_id
    }

@app.get("/api/video/{id}/status")
def get_video_status_endpoint(id: str):
    job = get_job_status(id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
        
    return {
        "success": True,
        "data": {
            "status": job["status"],
            "progress": job["progress"],
            "stage": job["stage"],
            "processedFrames": job["processedFrames"],
            "sampledFrames": job["sampledFrames"],
            "processingTime": job["processingTime"],
            "error": job["error"]
        }
    }

@app.get("/api/video/{id}/results")
def get_video_results_endpoint(id: str):
    job = get_job_status(id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
        
    if job["status"] == "failed":
        return {
            "success": False,
            "error": job.get("error", "Processing failed")
        }
        
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Analysis is not yet completed.")
        
    return {
        "success": True,
        "data": job["results"]
    }

@app.get("/api/video/{id}/frame")
def get_video_frame_endpoint(id: str, frameNumber: int = None, timestamp: float = None):
    job = get_job_status(id)
    if not job:
        raise HTTPException(status_code=404, detail="Video job not found.")
        
    filepath = job["filepath"]
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Video file does not exist on server.")
        
    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        raise HTTPException(status_code=500, detail="Failed to open video file.")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    if frameNumber is not None:
        target_frame = frameNumber
    elif timestamp is not None and fps > 0:
        target_frame = int(round(timestamp * fps))
    else:
        target_frame = 0
        
    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise HTTPException(status_code=400, detail=f"Could not read frame at index {target_frame}.")
        
    # Resize frame if too large to save bandwidth, but preserve standard display size
    h, w = frame.shape[:2]
    max_dim = 640
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        frame = cv2.resize(frame, (int(w * scale), int(h * scale)))
        
    # Run pose analysis to annotate the frame (skeleton overlay)
    result = process_image_array(frame, model, encoder, ideal_poses, fast_mode=True)
    
    # Draw skeleton or use the returned image (which is annotated RGB)
    if "image" in result:
        annotated_rgb = result["image"]
        annotated_bgr = cv2.cvtColor(annotated_rgb, cv2.COLOR_RGB2BGR)
    else:
        annotated_bgr = frame
        
    _, buffer = cv2.imencode('.jpg', annotated_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/jpeg")

@app.delete("/api/video/{id}")
def delete_video_endpoint(id: str):
    success = delete_job(id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {
        "success": True,
        "message": "Video job and temporary files deleted successfully."
    }

@app.get("/api/chatbot/status")
def get_chatbot_status_endpoint():
    from inference.chatbot_service import chatbot_status, check_services
    try:
        check_services()
    except Exception as e:
        print(f"Failed to check services: {e}")
    return {
        "success": True,
        "data": chatbot_status
    }

@app.post("/api/chatbot/query")
def post_chatbot_query(payload: ChatbotPayload):
    result = query_chatbot(payload.question)
    return result

@app.post("/api/v1/prediction/{chatflow_id}")
async def proxy_prediction(chatflow_id: str, payload: dict):
    from inference.chatbot_service import query_chatbot
    
    try:
        question = payload.get("question", "")
        result = query_chatbot(question)
        if result["success"]:
            return {
                "text": result["answer"],
                "sourceDocuments": result["sources"]
            }
        else:
            return {
                "text": result["answer"],
                "sourceDocuments": []
            }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to query local RAG: {e}")

@app.get("/api/poses")
def get_poses():
    if encoder is None or ideal_poses is None:
        return {"success": False, "data": []}
        
    pose_list = []
    classes = list(encoder.classes_)
    
    pose_descriptions = {
        "Akarna -Dhnurasan": "Archer's Pose executed on the Mallakhamb pole requiring leg flexibility and strong grip.",
        "Bagali_Phara": "Armpit latch hold pose demonstrating upper body balance and torso positioning.",
        "Bajarang_Pakad": "Hanuman style clasp hold requiring full body coordination on the pole.",
        "Mayurasan": "Peacock balance pose elevated horizontally on the pole using core strength.",
        "Padmasan": "Lotus posture mounted securely on the pole.",
        "Paschimottan": "Seated forward bend hold performed vertically on the pole.",
        "Sheersasan": "Headstand balance variation mounted on the top of the pole.",
        "Vrukshasan": "Tree pose balance performed on the vertical pole surface."
    }
    
    for idx, name in enumerate(classes):
        clean_name = POSE_NAME_MAP.get(name, name.replace("_", " "))
        pose_list.append({
            "id": idx + 1,
            "name": name,
            "title": clean_name,
            "category": "Pole Mallakhamb",
            "difficulty": "Advanced" if idx % 2 == 0 else "Intermediate",
            "description": pose_descriptions.get(name, f"Standard Mallakhamb posture {clean_name}."),
            "targetAngles": {
                "Elbows": "160°-180°",
                "Shoulders": "140°-160°",
                "Hips": "90°-120°",
                "Knees": "170°-180°"
            }
        })
        
    return {"success": True, "data": pose_list}

@app.get("/api/dashboard")
def get_dashboard_stats():
    return {
        "success": True,
        "data": {
            "totalDetections": 1420,
            "avgAccuracy": 94.2,
            "topPose": "Akarna Dhanurasan (Archer Pose)",
            "activeUsers": 38,
            "recentDetections": [
                {"id": 1, "pose": "Akarna Dhanurasan", "accuracy": 97.5, "time": "10 mins ago", "status": "Excellent"},
                {"id": 2, "pose": "Mayurasan (Peacock)", "accuracy": 91.2, "time": "25 mins ago", "status": "Very Good"},
                {"id": 3, "pose": "Sheersasan (Headstand)", "accuracy": 88.4, "time": "1 hour ago", "status": "Very Good"},
                {"id": 4, "pose": "Bajarang Pakad", "accuracy": 95.0, "time": "2 hours ago", "status": "Excellent"}
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=5000, reload=True)
