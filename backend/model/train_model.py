import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import cv2
import numpy as np
import joblib
import mediapipe as mp
from sklearn.ensemble import RandomForestClassifier



from utils.pose_detector import extract_landmarks


mp_pose = mp.solutions.pose

dataset_path = "../dataset"

data = []
labels = []

for pose in os.listdir(dataset_path):

    pose_folder = os.path.join(dataset_path, pose)

    for img_name in os.listdir(pose_folder):

        img_path = os.path.join(pose_folder, img_name)

        image = cv2.imread(img_path)

        landmarks = extract_landmarks(image)

        if landmarks is not None:
            data.append(landmarks)
            labels.append(pose)

X = np.array(data)
y = np.array(labels)

model = RandomForestClassifier(n_estimators=100)

model.fit(X, y)

joblib.dump(model, "pose_model.pkl")

print("Model trained successfully")