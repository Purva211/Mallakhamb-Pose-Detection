from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import joblib

from utils.pose_detector import extract_landmarks

image_predict = Blueprint("image_predict", __name__)

model = joblib.load("model/pose_model.pkl")

@image_predict.route("/predict", methods=["POST"])
def predict_image():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"})

    file = request.files["image"]

    image = cv2.imdecode(
        np.frombuffer(file.read(), np.uint8),
        cv2.IMREAD_COLOR
    )

    landmarks = extract_landmarks(image)

    if landmarks is None:
        return jsonify({"error": "Pose not detected"})

    prediction = model.predict([landmarks])[0]

    probability = model.predict_proba([landmarks]).max()

    accuracy = round(probability * 100, 2)

    return jsonify({
        "pose": prediction,
        "accuracy": accuracy
    })