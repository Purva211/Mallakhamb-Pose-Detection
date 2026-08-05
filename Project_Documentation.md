# Mallakhamb AI Pose Detection System - Project Documentation

This document serves as the master record of the development process, steps, results, and technical challenges for the Mallakhamb Pole Pose Detection System. It is designed to be highly readable for study and interview preparation.

---

## Phase 1: Dataset Preprocessing & Validation
**Goal:** Prepare a clean, balanced dataset for machine learning.
*   **Initial State:** 21 unbalanced classes with ~1,248 total images.
*   **Action Taken:** The user ran a preprocessing script to merge duplicate classes down to 19 distinct poses and applied data augmentation (flipping, rotation, brightness) to balance every class to exactly 250 images.
*   **Result:** A balanced dataset of 4,750 images stored in `Processed_Dataset/`.

## Phase 2: Pose Feature Extraction (MediaPipe)
**Goal:** Convert raw images of athletes into mathematical arrays (features) that a Machine Learning model can understand without being biased by the background or clothing.
*   **Action Taken:** We wrote `feature_extraction/extract_features.py`. The script looped through all 4,750 images and used Google's **MediaPipe Pose** model to extract the X, Y, Z, and Visibility coordinates for 33 body landmarks (132 features total per image).
*   **Crucial Step - Normalization:** To ensure the AI is invariant to camera distance and position, we mathematically translated the skeleton so the hips were at `(0,0)` and scaled the coordinates by the length of the athlete's torso.
*   **Challenges Occurred:** 
    *   *Dependency Conflict:* During extraction, we encountered a `ModuleNotFoundError` for MediaPipe, followed by a Numpy 2.0 C-API conflict with TensorFlow.
    *   *Resolution:* We downgraded Numpy to `<2.0` (version 1.26.4) and OpenCV to `<4.9` using `pip install --force-reinstall`.
*   **Result:** MediaPipe successfully extracted landmarks for 4,642 images (dropping 108 blurry/unusable images). The final geometric dataset was saved as `dataset/pose_landmarks.csv`.

## Phase 3: Pose Classification (Machine Learning)
**Goal:** Train a model to recognize the 19 different Mallakhamb poses based purely on the normalized skeleton data.
*   **Action Taken:** We wrote `models/train_classifier.py` and pitted four top-tier Machine Learning models against each other: Random Forest, XGBoost, Support Vector Machine (SVM), and K-Nearest Neighbors (KNN).
*   **Validation Strategy:** We used **5-Fold Cross Validation** (StratifiedKFold) to ensure the models were strictly evaluated on unseen data and were not overfitting. We evaluated based on F1-Score to ensure rare and common poses were treated equally.
*   **Results:**
    1.  **Random Forest:** 98.43% F1-Score (🏆 Winner)
    2.  **XGBoost:** 97.93% F1-Score
    3.  **KNN:** 96.63% F1-Score
    4.  **SVM (RBF):** 95.61% F1-Score
*   **Final Output:** The winning Random Forest model was retrained on the entire dataset for maximum knowledge and saved to `saved_models/best_pose_classifier.pkl`, along with the `label_encoder.pkl`.

---

## Phase 4: Pose Recognition & Scoring Pipeline (Completed)
**Goal:** Build the real-time inference engine that takes a new image, predicts the pose, and grades the athlete's accuracy.
*   **Architecture Decision (Ideal Pose):** The team decided to use **Option 1: Expert Choice** for the scoring baseline. Instead of relying on the AI's mathematical average (which could contain bad habits), the user manually selected 19 "perfect" images (one for each pose) performed by a master. The AI extracted the skeletons from these 19 images to serve as the absolute Gold Standard for grading users.
*   **Actions Taken:** 
    1.  We created `inference/extract_ideal_poses.py` to extract the Gold Standard skeletons from the 19 images and saved them to `dataset/ideal_poses.json`.
    2.  We created `inference/predict_pose.py`, which is the main engine. It loads an unseen image, normalizes the skeleton, predicts the pose using the Random Forest model, and handles the logic for Step 8 (rejecting poses with <70% confidence).
    3.  We implemented Step 6 (Pose Accuracy Score) by calculating the Cosine Similarity between the user's normalized skeleton and the Gold Standard skeleton, grading the user from 0-100%.
*   **Results:** The pipeline successfully predicted `Bajarang_Pakad` on a test image, overlaid the skeleton, rejected low-confidence predictions, and accurately scored the pose. The backend logic for the final web UI is now fully operational!

---

## Phase 5: Natural Language Pose Correction (Completed)
**Goal:** Provide actionable, English feedback to the athlete on how to fix their posture (Step 7).
*   **Actions Taken:** 
    1.  We implemented complex 3D Vector Mathematics in `predict_pose.py` to calculate the exact angle of 8 critical joints (Left/Right Elbows, Shoulders, Hips, and Knees).
    2.  The script now calculates these 8 angles for the User's skeleton and compares them against the 8 angles of the Gold Standard expert skeleton.
    3.  We implemented a **25-degree threshold rule**. If the user's joint angle differs from the expert's by more than 25 degrees, the script generates specific feedback telling the user to "Bend" or "Straighten" that specific joint.
*   **Results:** The system now successfully prints a `--- COACH FEEDBACK ---` section in the console and overlays the text directly onto the output image!

---

## Phase 6: Web Interface (Completed)
**Goal:** Build a beautiful, interactive web application to showcase the AI's capabilities.
*   **Actions Taken:**
    1.  Refactored `predict_pose.py` to act as an importable module (`process_image_array`) instead of just a command-line script.
    2.  Created an API server `server.py` integrating the Random Forest classifier, Pose Accuracy Scoring, and Natural Language Feedback.
*   **Results:** The backend API and AI models are integrated for the web application!

---

## Future Phase: YOLO Pole Detection (Step 2 - Pending)
*   **Next Action:** The user is currently annotating a custom dataset on Roboflow by drawing bounding boxes around Mallakhamb poles. Once the dataset is downloaded, we will write `models/train_yolo.py` to train a custom YOLOv8 model for Step 2 and integrate it into the UI.
