import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import human from './../assets/human.png';

const detectorConfig = {
  architecture: "MobileNetV1",
  outputStride: 16,
  inputResolution: { width: 640, height: 480 },
  multiplier: 0.75,
};

const DemoComp2 = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  const [startDetector, setStartDetector] = useState(false);
  const [bodyPartLengths, setBodyPartLengths] = useState({
    shoulderLength: 0,
    waistLength: 0,
    handLength: 0,
    legsLength: 0,
  });


  const loadModel = async () => {
    try {
      await tf.ready();
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.PoseNet,
        detectorConfig
      );
      setModel(detector);
    } catch (error) {
      console.error("Model initialization error:", error);
    }
  };

  const handleDetectorClick = async (e) => {
    setStartDetector(true);
    await loadModel();

  }

  useEffect(() => {
    const detectPose = async () => {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        // Get Video Properties
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        // Set canvas size to match video stream
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        // Make Detections
        const poses = await model.estimatePoses(video);
        const pose = poses[0];

        const scale_factor = 2.4
        const lengths = {
          shoulderLength: calculateLength(pose.keypoints.find((kp) => kp.name === 'left_shoulder'), pose.keypoints.find((kp) => kp.name === 'right_shoulder')) / scale_factor,
          waistLength: calculateLength(pose.keypoints.find((kp) => kp.name === 'left_hip'), pose.keypoints.find((kp) => kp.name === 'right_hip')) / scale_factor, 
          handLength: Math.min(
            calculateLength(
              pose.keypoints.find((kp) => kp.name === 'left_shoulder'),
              pose.keypoints.find((kp) => kp.name === 'left_wrist')
            ),
            calculateLength(
              pose.keypoints.find((kp) => kp.name === 'right_shoulder'),
              pose.keypoints.find((kp) => kp.name === 'right_wrist')
            )
          ) / 2.4,
          legsLength: Math.min(
            calculateLength(
              pose.keypoints.find((kp) => kp.name === 'left_hip'),
              pose.keypoints.find((kp) => kp.name === 'left_ankle')
            ),
            calculateLength(
              pose.keypoints.find((kp) => kp.name === 'right_hip'),
              pose.keypoints.find((kp) => kp.name === 'right_ankle')
            )
          ) / 2.4,
        };
        setBodyPartLengths(lengths);
        drawPosesOnCanvas(pose);
      }
    };
    const intervalId = setInterval(detectPose, 120);

    return () => clearInterval(intervalId);
  }, [model]);

  const drawPosesOnCanvas = (pose) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw keypoints
    for (let keypoint of pose.keypoints) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    }

    // Define connections for the skeleton
    const connections = [
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "right_hip"],

      ["nose", "left_eye"],
      ["nose", "right_eye"],
      ["left_eye", "left_ear"],
      ["right_eye", "right_ear"],
      ["nose", "neck"],
      // ['neck', 'left_shoulder'],
      // ['neck', 'right_shoulder'],
      // ['left_shoulder', 'left_elbow'],
      // ['left_elbow', 'left_wrist'],
      // ['right_shoulder', 'right_elbow'],
      // ['right_elbow', 'right_wrist'],
      // ['left_hip', 'right_hip'],
      // ['left_shoulder', 'left_hip'],
      // ['right_shoulder', 'right_hip'],
      // ['left_hip', 'left_knee'],
      // ['left_knee', 'left_ankle'],
      // ['right_hip', 'right_knee'],
      // ['right_knee', 'right_ankle']
    ];

    // Draw skeleton connections
    for (let connection of connections) {
      const partA = pose.keypoints.find((kp) => kp.name === connection[0]);
      const partB = pose.keypoints.find((kp) => kp.name === connection[1]);

      if (partA && partB) {
        ctx.beginPath();
        ctx.moveTo(partA.x, partA.y);
        ctx.lineTo(partB.x, partB.y);
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  const calculateLength = (partA, partB) => {
    return Math.sqrt(Math.pow(partB.x - partA.x, 2) + Math.pow(partB.y - partA.y, 2));
  };


  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[640px] h-[480px] flex items-center justify-center border-[8px] mt-[2rem]">
        {!startDetector ? (
          <>
             <button className="bg-green-400 text-white p-4 rounded-xl" onClick = {handleDetectorClick}>Start Detector</button>
          </>
        ) : (
          <>
          { model === null ? <>Loading Model...</> : <>
          <Webcam
              ref={webcamRef}
              autoPlay
              playsInline
              style={{ width: "640px", height: "480px" }} // Adjust webcam style
            />
            <img src = {human} alt = "" className="absolute h-full w-full object-contain opacity-50"/>
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 z-[1] transparent"
              style={{ width: "640px", height: "480px" }} // Adjust canvas style
            />
          </>
          }
          </>
        )}
      </div>
      <div className="mt-[1rem]">
        <h1>Shoulder Length: {bodyPartLengths.shoulderLength.toFixed(2)} cm</h1>
        <h1>Waist Length: {bodyPartLengths.waistLength.toFixed(2)} cm</h1>
        <h1>Hand Length: {bodyPartLengths.handLength.toFixed(2)} cm</h1>
        <h1>Legs Length: {bodyPartLengths.legsLength.toFixed(2)} cm</h1>
      </div>
    </div>
  );
};

export default DemoComp2;
