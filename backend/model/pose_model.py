import os
import cv2
import mediapipe as mp
import numpy as np
import sys
# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


def extract_landmarks(image):
    """
    Extract pose landmarks from an image using MediaPipe.
    Returns a list of landmark coordinates.
    """

    # Convert BGR image to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Process image with MediaPipe
    results = pose.process(image_rgb)

    if results.pose_landmarks:

        landmarks = []

        for lm in results.pose_landmarks.landmark:

            # x, y, z coordinates
            landmarks.append(lm.x)
            landmarks.append(lm.y)
            landmarks.append(lm.z)

        return landmarks

    return None