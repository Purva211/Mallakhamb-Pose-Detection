import os
import cv2
import json
import mediapipe as mp
import numpy as np
import math

# Configurations
IDEAL_POSES_DIR = r"C:\Users\vrush\Capstone_New\dataset\ideal_poses"
OUTPUT_JSON = r"C:\Users\vrush\Capstone_New\dataset\ideal_poses.json"

# Initialize MediaPipe
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, model_complexity=2, min_detection_confidence=0.5)

def normalize_landmarks(landmarks):
    """
    Normalizes landmarks using exactly the same logic as the training dataset.
    """
    LEFT_SHOULDER, RIGHT_SHOULDER = 11, 12
    LEFT_HIP, RIGHT_HIP = 23, 24

    points = []
    for lm in landmarks.landmark:
        points.append([lm.x, lm.y, lm.z, lm.visibility])
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

    torso_size = math.sqrt(
        (shoulder_center_x - 0)**2 + 
        (shoulder_center_y - 0)**2 + 
        (shoulder_center_z - 0)**2
    )

    if torso_size > 0:
        points[:, 0] /= torso_size
        points[:, 1] /= torso_size
        points[:, 2] /= torso_size

    # Return flattened array
    return points.flatten().tolist()

def main():
    from collections import defaultdict
    ideal_poses_data = defaultdict(list)
    
    if not os.path.exists(IDEAL_POSES_DIR):
        print(f"Directory not found: {IDEAL_POSES_DIR}")
        return

    entries = os.listdir(IDEAL_POSES_DIR)
    print(f"Found {len(entries)} entries in ideal_poses folder. Extracting Gold Standard skeletons...")

    failed_images = []
    
    # Process all files and subdirectories
    for entry in entries:
        entry_path = os.path.join(IDEAL_POSES_DIR, entry)
        
        # Determine images to process and the corresponding pose name
        images_to_process = []
        if os.path.isdir(entry_path):
            pose_name = entry
            for f in os.listdir(entry_path):
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    images_to_process.append((os.path.join(entry_path, f), f))
        elif entry.lower().endswith(('.png', '.jpg', '.jpeg')):
            # If the user names files like Bajarang_Pakad_1.jpg, they should ideally use folders instead
            # For root files, we just use the filename without extension as pose name
            pose_name = os.path.splitext(entry)[0]
            
            # To support simple hyphen/underscore suffixes for multiple files (e.g. PoseName-1.jpg),
            # we can strip the suffix if it's purely a number. But to be safe and avoid breaking "Natarajasan1",
            # we encourage users to use subfolders.
            images_to_process.append((entry_path, entry))
            
        for img_path, img_name in images_to_process:
            image = cv2.imread(img_path)
            if image is None:
                print(f"Error: Could not read {img_name}")
                failed_images.append(img_name)
                continue
                
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)
            
            if results.pose_landmarks:
                normalized_features = normalize_landmarks(results.pose_landmarks)
                ideal_poses_data[pose_name].append(normalized_features)
                print(f" [SUCCESS] Extracted expert skeleton for: {pose_name} (from {img_name})")
            else:
                print(f" [FAILED] Could not detect human in: {img_name}")
                failed_images.append(img_name)

    # Save to JSON
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(ideal_poses_data, f, indent=4)
        
    print("\n--- Summary ---")
    print(f"Successfully processed: {len(ideal_poses_data)} poses.")
    if failed_images:
        print(f"Failed to process: {len(failed_images)} images -> {failed_images}")
    else:
        print("All expert images processed perfectly!")
        
    print(f"Gold Standard dataset saved to: {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
