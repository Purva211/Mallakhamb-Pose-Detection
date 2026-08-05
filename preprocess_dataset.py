import os
import cv2
import glob
import random
import numpy as np
from pathlib import Path
from tqdm import tqdm
import shutil

# Configurations
SOURCE_DIR = r"C:\Users\vrush\Capstone_New\Raw_Dataset"
TARGET_DIR = r"C:\Users\vrush\Capstone_New\Processed_Dataset"
TARGET_COUNT = 250
TARGET_SIZE = (224, 224)

# Define augmentations
def apply_augmentation(img):
    aug_type = random.randint(0, 3)
    if aug_type == 0:
        # Horizontal Flip
        return cv2.flip(img, 1)
    elif aug_type == 1:
        # Random Rotation (-15 to 15 degrees)
        angle = random.uniform(-15, 15)
        h, w = img.shape[:2]
        M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1)
        return cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REPLICATE)
    elif aug_type == 2:
        # Brightness/Contrast variation
        alpha = random.uniform(0.8, 1.2) # Contrast control
        beta = random.uniform(-20, 20)   # Brightness control
        return cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    else:
        # Blur
        return cv2.GaussianBlur(img, (5, 5), 0)

def main():
    if os.path.exists(TARGET_DIR):
        print(f"Cleaning existing target directory: {TARGET_DIR}")
        shutil.rmtree(TARGET_DIR)
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    classes = [d for d in os.listdir(SOURCE_DIR) if os.path.isdir(os.path.join(SOURCE_DIR, d))]
    print(f"Found {len(classes)} classes.")
    
    for cls in tqdm(classes, desc="Processing classes"):
        cls_src_dir = os.path.join(SOURCE_DIR, cls)
        cls_tgt_dir = os.path.join(TARGET_DIR, cls)
        os.makedirs(cls_tgt_dir, exist_ok=True)
        
        # Gather all valid image files
        valid_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.webp')
        all_files = os.listdir(cls_src_dir)
        image_files = [f for f in all_files if f.lower().endswith(valid_extensions)]
        
        # Filter corrupted images and load them
        valid_images = []
        for f in image_files:
            img_path = os.path.join(cls_src_dir, f)
            try:
                img = cv2.imread(img_path)
                if img is not None:
                    # Resize and ensure RGB
                    img = cv2.resize(img, TARGET_SIZE)
                    valid_images.append(img)
                else:
                    print(f"Could not read {img_path}")
            except Exception as e:
                print(f"Error reading {img_path}: {e}")
                
        num_valid = len(valid_images)
        print(f"\nClass '{cls}': {num_valid} valid images found.")
        
        if num_valid == 0:
            print(f"WARNING: Class {cls} has no valid images. Skipping.")
            continue
            
        final_images = []
        if num_valid >= TARGET_COUNT:
            # Downsample if we have more than TARGET_COUNT
            final_images = random.sample(valid_images, TARGET_COUNT)
        else:
            # Augment if we have less than TARGET_COUNT
            final_images = valid_images.copy()
            num_to_augment = TARGET_COUNT - num_valid
            for _ in range(num_to_augment):
                base_img = random.choice(valid_images)
                aug_img = apply_augmentation(base_img)
                final_images.append(aug_img)
                
        # Save to target directory with consistent naming
        for idx, img in enumerate(final_images):
            # Format: class_name_001.jpg
            filename = f"{cls.replace(' ', '_')}_{idx+1:03d}.jpg"
            tgt_path = os.path.join(cls_tgt_dir, filename)
            cv2.imwrite(tgt_path, img)

    print("Data preprocessing and balancing completed successfully!")

if __name__ == "__main__":
    main()
