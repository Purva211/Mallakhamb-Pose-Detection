import os
import time
import cv2
import math
import numpy as np
import logging
from inference.predict_pose import process_image_array, detect_pole, extract_angles, calculate_accuracy, get_grade, generate_feedback

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("video_service")

# Global in-memory job store
# Structure:
# {
#    job_id: {
#        "status": "uploading" | "pending" | "extracting" | "detecting" | "stabilizing" | "completed" | "failed",
#        "progress": 0,
#        "stage": "idle",
#        "filename": "",
#        "filepath": "",
#        "duration": 0.0,
#        "fps": 0.0,
#        "totalFrames": 0,
#        "sampledFrames": 0,
#        "processedFrames": 0,
#        "startTime": 0.0,
#        "processingTime": 0.0,
#        "error": None,
#        "results": None
#    }
# }
video_jobs = {}

def get_job_status(job_id: str):
    return video_jobs.get(job_id)

def delete_job(job_id: str):
    job = video_jobs.get(job_id)
    if job:
        filepath = job.get("filepath")
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
                logger.info(f"Deleted temporary video file: {filepath}")
            except Exception as e:
                logger.error(f"Failed to delete {filepath}: {e}")
        video_jobs.pop(job_id, None)
        return True
    return False

def stabilize_poses(detections, window_size=3, transition_threshold=2):
    """
    Stabilizes the detected poses using a rolling window vote.
    Prevents single-frame noise/errors from flipping predictions.
    """
    if not detections:
        return []

    stabilized = []
    current_pose = "Uncertain / Unknown Pose"

    for i in range(len(detections)):
        start_idx = max(0, i - window_size + 1)
        window = detections[start_idx : i + 1]

        counts = {}
        for det in window:
            pose = det["pose"]
            counts[pose] = counts.get(pose, 0) + 1

        most_frequent_pose = max(counts, key=counts.get)
        freq = counts[most_frequent_pose]

        # Transition only if the new pose is seen at least transition_threshold times
        if most_frequent_pose != current_pose:
            if freq >= transition_threshold:
                current_pose = most_frequent_pose

        # Fallback if current_pose is completely gone from the window
        if current_pose not in counts:
            current_pose = most_frequent_pose

        det_copy = dict(detections[i])
        
        # If the stabilized pose differs, override fields
        if det_copy["pose"] != current_pose:
            det_copy["pose"] = current_pose
            if current_pose == "Uncertain / Unknown Pose":
                det_copy["status"] = "Uncertain"
                det_copy["accuracy"] = 0.0
                det_copy["feedback"] = ["Pose is uncertain or transitionary."]
                det_copy["grade"] = "Needs Improvement"
            else:
                # Borrow accuracy/feedback from the latest window detection matching the stabilized pose
                matching_det = next((d for d in reversed(window) if d["pose"] == current_pose), None)
                if matching_det:
                    det_copy["status"] = matching_det["status"]
                    det_copy["accuracy"] = matching_det["accuracy"]
                    det_copy["feedback"] = matching_det["feedback"]
                    det_copy["grade"] = matching_det["grade"]
                    det_copy["raw_pose"] = matching_det.get("raw_pose", "")
                    det_copy["incorrectRegions"] = matching_det.get("incorrectRegions", [])
                else:
                    det_copy["status"] = "Correct"
                    det_copy["accuracy"] = det_copy["confidence"]
                    det_copy["feedback"] = ["Good posture alignment."]
                    det_copy["grade"] = "Good"
                    det_copy["incorrectRegions"] = []
                    
        stabilized.append(det_copy)

    return stabilized

def generate_segments(detections):
    """
    Groups contiguous frame detections of the same pose into timeline segments.
    """
    if not detections:
        return []

    segments = []
    current_seg = None

    for det in detections:
        pose = det["pose"]
        t = det["timestamp"]
        conf = det["confidence"]

        if current_seg is None:
            current_seg = {
                "pose": pose,
                "startTime": t,
                "endTime": t,
                "duration": 0.0,
                "confidences": [conf]
            }
        elif current_seg["pose"] == pose:
            current_seg["endTime"] = t
            current_seg["confidences"].append(conf)
        else:
            # Complete previous segment
            current_seg["duration"] = round(current_seg["endTime"] - current_seg["startTime"], 2)
            current_seg["averageConfidence"] = round(sum(current_seg["confidences"]) / len(current_seg["confidences"]), 1)
            del current_seg["confidences"]
            segments.append(current_seg)

            # Start new segment
            current_seg = {
                "pose": pose,
                "startTime": t,
                "endTime": t,
                "duration": 0.0,
                "confidences": [conf]
            }

    if current_seg is not None:
        current_seg["duration"] = round(current_seg["endTime"] - current_seg["startTime"], 2)
        current_seg["averageConfidence"] = round(sum(current_seg["confidences"]) / len(current_seg["confidences"]), 1)
        del current_seg["confidences"]
        segments.append(current_seg)

    return segments

def analyze_video_task(job_id: str, filepath: str, config: dict, model, encoder, ideal_poses):
    """
    Asynchronous background task to process the video frame-by-frame (with sampling).
    """
    job = video_jobs.get(job_id)
    if not job:
        logger.error(f"Job {job_id} not found in global register.")
        return

    try:
        job["startTime"] = time.time()
        job["status"] = "processing"
        job["stage"] = "Preparing Video"
        job["progress"] = 5
        
        cap = cv2.VideoCapture(filepath)
        if not cap.isOpened():
            raise ValueError("Failed to open video file.")

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        job["fps"] = fps
        job["totalFrames"] = total_frames
        job["duration"] = duration

        # Configurable sampling
        # Default analysis FPS: 3.0 frames per second
        analysis_fps = config.get("analysisFps", 3.0)
        confidence_threshold = config.get("confidenceThreshold", 52.0) # 0.52 * 100
        window_size = config.get("windowSize", 3)
        transition_threshold = config.get("transitionThreshold", 2)

        sample_step = 1
        if fps > 0 and analysis_fps > 0:
            sample_step = max(1, int(round(fps / analysis_fps)))

        # Create list of frame indexes to sample
        sample_frame_indices = list(range(0, total_frames, sample_step))
        job["sampledFrames"] = len(sample_frame_indices)
        job["stage"] = "Extracting Frames"
        job["progress"] = 10

        logger.info(f"Starting analysis for video {job_id}. Total frames: {total_frames}, FPS: {fps:.2f}, sampling step: {sample_step}. Sampled frames: {len(sample_frame_indices)}")

        detections = []
        processed_count = 0

        # Preprocessing & ML Inference Loop
        job["stage"] = "Detecting Poses"
        for frame_idx in sample_frame_indices:
            # Check if job was deleted while running
            if job_id not in video_jobs:
                logger.info(f"Job {job_id} was deleted. Terminating execution.")
                cap.release()
                return

            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if not ret:
                logger.warning(f"Could not read frame at index {frame_idx}")
                continue

            timestamp = round(frame_idx / fps, 2)

            # Resize frame to smaller dimension (only for inference) to speed up MediaPipe
            h, w = frame.shape[:2]
            max_size = 480
            if max(h, w) > max_size:
                scale = max_size / max(h, w)
                resized_frame = cv2.resize(frame, (int(w * scale), int(h * scale)))
            else:
                resized_frame = frame.copy()

            # Execute pose detection
            # Note: Using fast_mode=True to skip expensive rotation passes for video frames
            result = process_image_array(resized_frame, model, encoder, ideal_poses, fast_mode=True)
            
            # Analyze correctness status
            det_status = "Correct"
            feedback = ["Good posture alignment."]
            pose_name = "Uncertain / Unknown Pose"
            raw_pose = "Unrecognized"
            confidence = 0.0
            accuracy = 0.0
            grade = "Needs Improvement"
            incorrect_regions = []

            if "error" not in result:
                confidence = result["confidence"]
                
                # Check if pose is unrecognized
                if result.get("unrecognized", False) or confidence < confidence_threshold:
                    pose_name = "Uncertain / Unknown Pose"
                    det_status = "Uncertain"
                    feedback = ["Pose is unrecognized or uncertain."]
                else:
                    pose_name = result["pose"]
                    raw_pose = result.get("raw_pose", "Standard Pose")
                    accuracy = result.get("accuracy", 0.0)
                    grade = result.get("grade", "Needs Improvement")
                    feedback = result.get("feedback", ["Good posture alignment."])
                    
                    if accuracy >= 75.0:
                        det_status = "Correct"
                    else:
                        det_status = "Incorrect"
                        # Determine incorrect body region based on feedback tips
                        for tip in feedback:
                            lower_tip = tip.lower()
                            if "elbow" in lower_tip or "shoulder" in lower_tip:
                                if "Upper Body" not in incorrect_regions:
                                    incorrect_regions.append("Upper Body")
                            if "hip" in lower_tip or "knee" in lower_tip:
                                if "Lower Body" not in incorrect_regions:
                                    incorrect_regions.append("Lower Body")
                            if "head" in lower_tip or "neck" in lower_tip or "face" in lower_tip:
                                if "Face/Head" not in incorrect_regions:
                                    incorrect_regions.append("Face/Head")
            else:
                det_status = "No Athlete"
                feedback = ["No athlete detected in this frame."]

            detections.append({
                "frameNumber": frame_idx,
                "timestamp": timestamp,
                "pose": pose_name,
                "raw_pose": raw_pose,
                "confidence": confidence,
                "accuracy": accuracy,
                "status": det_status,
                "grade": grade,
                "feedback": feedback,
                "incorrectRegions": incorrect_regions
            })

            processed_count += 1
            job["processedFrames"] = processed_count
            
            # Progress calculation (from 10% to 90%)
            percent = 10 + int((processed_count / len(sample_frame_indices)) * 80)
            job["progress"] = percent
            job["processingTime"] = round(time.time() - job["startTime"], 1)

        cap.release()

        # Step 5: Temporal Pose Stabilization
        job["stage"] = "Generating Results"
        job["progress"] = 92
        logger.info(f"Stabilizing poses for job {job_id} using window_size={window_size}")
        stabilized_detections = stabilize_poses(detections, window_size=window_size, transition_threshold=transition_threshold)

        # Step 6: Generate Timeline Segments
        job["progress"] = 96
        logger.info(f"Generating timeline segments for job {job_id}")
        segments = generate_segments(stabilized_detections)

        # Remove raw_pose from final output sent to frontend to keep JSON light
        clean_detections = []
        for det in stabilized_detections:
            clean_det = {
                "frameNumber": det["frameNumber"],
                "timestamp": det["timestamp"],
                "pose": det["pose"],
                "confidence": det["confidence"],
                "accuracy": det["accuracy"],
                "status": det["status"],
                "grade": det["grade"],
                "feedback": det["feedback"],
                "incorrectRegions": det.get("incorrectRegions", [])
            }
            clean_detections.append(clean_det)

        # Calculate average confidence of valid detections
        valid_confs = [d["confidence"] for d in clean_detections if d["status"] != "No Athlete" and d["status"] != "Uncertain"]
        avg_conf = round(sum(valid_confs) / len(valid_confs), 1) if valid_confs else 0.0

        # Save results object
        job["processingTime"] = round(time.time() - job["startTime"], 1)
        job["results"] = {
            "videoId": job_id,
            "filename": job["filename"],
            "duration": round(duration, 1),
            "fps": round(fps, 1),
            "totalFrames": total_frames,
            "sampledFrames": len(sample_frame_indices),
            "processingTime": job["processingTime"],
            "averageConfidence": avg_conf,
            "status": "completed",
            "detections": clean_detections,
            "segments": segments
        }

        job["progress"] = 100
        job["stage"] = "Completed"
        job["status"] = "completed"
        logger.info(f"Successfully completed analysis for video {job_id} in {job['processingTime']}s")

    except Exception as e:
        logger.error(f"Error analyzing video {job_id}: {e}", exc_info=True)
        job["status"] = "failed"
        job["stage"] = "Completed"
        job["error"] = str(e)
