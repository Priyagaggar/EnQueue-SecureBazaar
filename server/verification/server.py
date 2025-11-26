from flask import Flask, request, jsonify
from test import FaceVerificationModel

app = Flask(__name__)
model = FaceVerificationModel()

@app.route("/verify", methods=["POST"])
def verify():
    file1 = request.files['image1']
    file2 = request.files['image2']

    img1_path = "temp1.jpg"
    img2_path = "temp2.jpg"

    file1.save(img1_path)
    file2.save(img2_path)

    same, confidence = model.verify(img1_path, img2_path)

    return jsonify({
        "match": bool(same),
        "confidence": float(confidence)
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
