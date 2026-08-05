import os
import cv2
import csv
import mediapipe as mp
import numpy as np
from pathlib import Path
from tqdm import tqdm
import math
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_DIR = os.path.join(BASE_DIR, "Processed_Dataset")
OUTPUT_DIR = os.path.join(BASE_DIR, "dataset")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "pose_landmarks.csv")
TASK_MODEL_PATH = os.path.join(BASE_DIR, "models", "pose_landmarker_full.task")

# Initialize MediaPipe Pose Landmarker
base_options = python.BaseOptions(model_asset_path=TASK_MODEL_PATH)
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.IMAGE,
    num_poses=1,
    min_pose_detection_confidence=0.5,
    min_pose_presence_confidence=0.5
)
detector = vision.PoseLandmarker.create_from_options(options)

def normalize_landmarks(landmarks):
    """
    Normalizes landmarks to be scale and translation invariant.
    1. Translation: Move origin (0,0) to the center of the hips.
    2. Scale: Divide all coordinates by the torso size (distance from shoulder center to hip center).
    """
    # Landmark indices based on MediaPipe
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_HIP = 23
    RIGHT_HIP = 24

    # Get raw coordinates
    points = []
    for lm in landmarks:
        points.append([lm.x, lm.y, lm.z, getattr(lm, 'visibility', 0.99)])
    points = np.array(points)

    # 1. Translation (Center on hips)
    hip_center_x = (points[LEFT_HIP][0] + points[RIGHT_HIP][0]) / 2.0
    hip_center_y = (points[LEFT_HIP][1] + points[RIGHT_HIP][1]) / 2.0
    hip_center_z = (points[LEFT_HIP][2] + points[RIGHT_HIP][2]) / 2.0

    points[:, 0] -= hip_center_x
    points[:, 1] -= hip_center_y
    points[:, 2] -= hip_center_z

    # 2. Scale (Normalize by torso length)
    shoulder_center_x = (points[LEFT_SHOULDER][0] + points[RIGHT_SHOULDER][0]) / 2.0
    shoulder_center_y = (points[LEFT_SHOULDER][1] + points[RIGHT_SHOULDER][1]) / 2.0
    shoulder_center_z = (points[LEFT_SHOULDER][2] + points[RIGHT_SHOULDER][2]) / 2.0

    # Calculate 3D distance between translated shoulder center and translated hip center
    torso_size = math.sqrt(
        (shoulder_center_x - 0)**2 + 
        (shoulder_center_y - 0)**2 + 
        (shoulder_center_z - 0)**2
    )

    if torso_size > 0:
        points[:, 0] /= torso_size
        points[:, 1] /= torso_size
        points[:, 2] /= torso_size

    # Flatten array [x0, y0, z0, v0, x1, y1, z1, v1...]
    return points.flatten().tolist()

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    classes = [d for d in os.listdir(SOURCE_DIR) if os.path.isdir(os.path.join(SOURCE_DIR, d))]
    
    # Prepare CSV Header
    header = ['label']
    for i in range(33):
        header.extend([f'x{i}', f'y{i}', f'z{i}', f'v{i}'])
        
    valid_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.webp')
    
    with open(OUTPUT_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        
        total_processed = 0
        total_failed = 0
        
        for cls in classes:
            cls_dir = os.path.join(SOURCE_DIR, cls)
            image_files = [img for img in os.listdir(cls_dir) if img.lower().endswith(valid_extensions)]
            
            print(f"\nProcessing class: {cls} ({len(image_files)} images)")
            
            for img_name in tqdm(image_files):
                img_path = os.path.join(cls_dir, img_name)
                
                try:
                    image = cv2.imread(img_path)
                    if image is None:
                        continue
                        
                    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
                    results = detector.detect(mp_image)
                    
                    if results.pose_landmarks and len(results.pose_landmarks) > 0:
                        normalized_features = normalize_landmarks(results.pose_landmarks[0])
                        row = [cls] + normalized_features
                        writer.writerow(row)
                        total_processed += 1
                    else:
                        total_failed += 1
                except Exception as e:
                    print(f"Error processing {img_path}: {e}")
                    total_failed += 1
                    
    print("\nFeature Extraction Complete!")
    print(f"Successfully extracted landmarks from {total_processed} images.")
    print(f"Failed to detect human in {total_failed} images.")
    print(f"Dataset saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
