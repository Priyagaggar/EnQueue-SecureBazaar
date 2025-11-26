import React, { useEffect, useRef, useState } from "react";

const FaceVerification = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [cameraPreview, setCameraPreview] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);


    const [cameraImage, setCameraImage] = useState(null);
    const [uploadImage, setUploadImage] = useState(null);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);


    // Start camera
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
            })
            .catch(err => console.error("Camera error:", err));
    }, []);

    // Capture live photo
    const captureImage = () => {
        if (!canvasRef.current || !videoRef.current) {
            alert("Camera not ready yet ⚠️");
            return;
        }

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth || 400;
        canvas.height = video.videoHeight || 300;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");
        setCameraImage(imageData);
        setCameraPreview(imageData);
    };


    // Upload image
    const handleUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return; // ✅ prevent Blob error

        setUploadImage(file);

        const reader = new FileReader();
        reader.onload = () => {
            setUploadPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };



    // ✅ FIXED VERIFY FUNCTION
    const verifyFace = async () => {
        if (!cameraImage || !uploadImage) {
            setResult({ success: false, message: "Please capture live photo AND upload an image ❗" });
            return;
        }

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        function base64ToBlob(base64) {
            const arr = base64.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

// use it here
        const cameraBlob = base64ToBlob(cameraImage);

        formData.append("image1", cameraBlob, "live.jpg");
        formData.append("image2", uploadImage);

        try {
            const response = await fetch("http://127.0.0.1:5001/verify", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.match) {
                setResult({
                    success: true,
                    message: `✅ Face Matched (Confidence: ${data.confidence.toFixed(2)})`
                });

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                setResult({
                    success: false,
                    message: `❌ Face Not Matched (Confidence: ${data.confidence.toFixed(2)})`
                });
            }

        } catch (error) {
            console.error(error);
            setResult({
                success: false,
                message: "❌ Server error during verification"
            });
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={{ textAlign: "center" }}>
            <h2>Face Verification</h2>

            <div style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "flex-start",
                marginTop: "20px"
            }}>

                {/* LEFT - LIVE CAMERA */}
                <div style={{ width: "25%" }}>
                    <h3>Live Camera</h3>
                    <video ref={videoRef} autoPlay width="100%" />
                    <br />
                    <button onClick={captureImage}>Capture</button>
                    <canvas ref={canvasRef} style={{ display: "none" }} />


                    {cameraImage && (
                        <>
                            <h4>Live Capture Preview</h4>
                            <img src={cameraPreview} alt="Live Preview" width="100%" />
                        </>
                    )}
                </div>

                {/* RIGHT - UPLOAD IMAGE */}
                <div style={{ width: "25%" }}>
                    <h3>Upload Image</h3>
                    <input type="file" accept="image/*" onChange={handleUpload} />

                    {uploadImage && (
                        <>
                            <h4>Uploaded Preview</h4>
                            <img
                                src={uploadPreview}
                                alt="Upload Preview"
                                width="100%"
                            />
                        </>
                    )}
                </div>

            </div>

            <br />
            <button onClick={verifyFace} style={{ marginTop: "20px" }}>
                Verify Face
            </button>

            {loading && <p style={{ color: "orange" }}>Verifying face...</p>}

            {result && (
                <div style={{
                    marginTop: "15px",
                    padding: "10px",
                    borderRadius: "6px",
                    color: result.success ? "green" : "red",
                    background: result.success ? "#e6ffee" : "#ffe6e6",
                    fontWeight: "bold"
                }}>
                    {result.message}
                </div>
            )}
        </div>

    );
};

export default FaceVerification;
