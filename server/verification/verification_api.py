from flask import Flask, request, jsonify
from test import FaceVerificationModel

app = Flask(__name__)
model = FaceVerificationModel()

@app.route("/verify-face", methods=["POST"])
def verify_face():
    img1 = request.files['img1']
    img2 = request.files['img2']

    img1.save("webcam.jpg")
    img2.save("upload.jpg")

    same, confidence = model.verify("webcam.jpg", "upload.jpg")

    return jsonify({
        "same": same,
        "confidence": float(confidence)
    })

if __name__ == "__main__":
    app.run(port=5001)
