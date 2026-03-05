import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose

pose = mp_pose.Pose(static_image_mode=True)

def extract_landmarks(image):

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    results = pose.process(image_rgb)

    if results.pose_landmarks:

        landmarks = []

        for lm in results.pose_landmarks.landmark:

            landmarks.append(lm.x)
            landmarks.append(lm.y)
            landmarks.append(lm.z)

        return landmarks

    return None