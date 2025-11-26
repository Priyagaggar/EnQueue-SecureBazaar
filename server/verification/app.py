from flask import Flask, request, jsonify
from flask_cors import CORS
from test import FaceVerificationModel
import os

app = Flask(__name__)
CORS(app)

model = FaceVerificationModel()

@app.route("/")
def home():
    return {"status": "Face Verification API Running"}

@app.route("/verify", methods=["POST"])
def verify_face():
    img1 = request.files.get("image1")
    img2 = request.files.get("image2")

    print("FILES RECEIVED:", request.files)

    if not img1 or not img2:
        return jsonify({"error": "Images required"}), 400

    path1 = "temp1.jpg"
    path2 = "temp2.jpg"

    img1.save(path1)
    img2.save(path2)

    print("Image1 size:", os.path.getsize(path1))
    print("Image2 size:", os.path.getsize(path2))

    same, confidence = model.verify(path1, path2)

    print("MODEL OUTPUT -> same:", same, "confidence:", confidence)

    return jsonify({
        "match": bool(same),
        "confidence": float(confidence)
    })


if __name__ == "__main__":
    app.run(port=5001, debug=True)
