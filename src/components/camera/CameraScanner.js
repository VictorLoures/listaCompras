import React, { useRef, useEffect } from "react";
import { toast } from "react-toastify";

import "./cameraScanner.css";

const CameraCapture = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const acessoPermitido = useRef();

  const getAcessoCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        acessoPermitido.current = true;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        toast.error("Não foi possível acessar a camera", err);
        acessoPermitido.current = false;
      });
  };

  useEffect(getAcessoCamera, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const boxWidth = canvas.width * 0.25;
    const boxHeight = canvas.height * 0.25;

    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = (canvas.height - boxHeight) / 2;

    canvas.width = boxWidth;
    canvas.height = boxHeight;

    const context = canvas.getContext("2d");
    context.drawImage(
      video,
      boxX,
      boxY,
      boxWidth,
      boxHeight,
      0,
      0,
      boxWidth,
      boxHeight
    );

    const imageBase64 = canvas.toDataURL("image/jpeg");

    fetch("http://localhost:3099/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64: imageBase64 }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        toast.success(data.digits || data.raw);
      })
      .catch((err) => {
        console.error("Erro ao enviar imagem:", err);
        toast.error("Erro ao processar a imagem.");
      });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative" }}>
        <video ref={videoRef} autoPlay playsInline className="cam" />
        <div className="scanner-box" />
      </div>
      <br />
      <button
        onClick={capturePhoto}
        className="button-reset"
        style={{ color: "white" }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <i class="bi bi-camera" style={{ fontSize: "24px" }}></i>{" "}
          <span>Ler preço</span>
        </div>
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default CameraCapture;
