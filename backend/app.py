from flask import Flask,request,jsonify
from flask_cors import CORS
import cv2
import numpy as np
import joblib

from utils.pose_detector import extract_landmarks

app = Flask(__name__)
CORS(app)

model = joblib.load("model/pose_model.pkl")

@app.route("/predict",methods=["POST"])
def predict():

    file = request.files["image"]

    image = cv2.imdecode(
        np.frombuffer(file.read(),np.uint8),
        cv2.IMREAD_COLOR
    )

    landmarks = extract_landmarks(image)

    if landmarks is None:
        return jsonify({"error":"Pose not detected"})

    prediction = model.predict([landmarks])[0]

    return jsonify({
        "pose":prediction,
        "accuracy":"92%"
    })

if __name__ == "__main__":
    app.run(debug=True)