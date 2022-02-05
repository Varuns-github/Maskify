import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam"; 
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as FaceDetection from "@tensorflow-models/face-landmarks-detection";
import { draw } from "./draw"

export default function App() {
  const webcamRef = useRef<Webcam>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);

  const getVideoInfo = () => {
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      if (video) {
        const height = video.videoHeight;
        const width = video.videoWidth;
        return { height, width };
      }
    }
    return { height: 0, width: 0 };
  };

  const detectFace = async () => {
    const video = webcamRef.current?.video;
    if (video && maskRef.current) {
      const model = await FaceDetection.load(
        FaceDetection.SupportedPackages.mediapipeFacemesh
      );
      const predictions = await model.estimateFaces({input: video});
      const { height, width } = getVideoInfo();
      maskRef.current.width = width;
      maskRef.current.height = height;

      const ctx = maskRef.current.getContext("2d") as CanvasRenderingContext2D;
      requestAnimationFrame(() => {
        draw(predictions, ctx, width, height);
      });
      return predictions;
    }
    return [];
  };

  useEffect(() => {
    console.log(webcamRef.current?.video?.readyState);
    setInterval(() => {
      detectFace();
    }
    , 200);
  }, [])

  return (<>
  <Webcam ref={webcamRef}  style={{
          position: "absolute",
          margin: "auto",
        }} />
  <canvas
        ref={maskRef}
        style={{
          position: "absolute",
          margin: "auto",
        }}
      />
  </>);
}
