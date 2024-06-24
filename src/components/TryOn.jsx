import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as THREE from "three";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import glass3 from "./../assets/images/aviator.png";
import glass1 from "./../assets/images/glasses.png";
import glass2 from "./../assets/images/sunglasses.png";
import necklace1 from "./../assets/images/necklace.png";
import necklace2 from "./../assets/images/necklace3.png";

const glassesList = [
  {
    name: "Glass1",
    src: glass3,
  },
  {
    name: "Glass2",
    src: glass1,
  },
  {
    name: "Glass3",
    src: glass2,
  },
];

const necklaceList = [
  {
    name: "Necklace1",
    src: necklace1,
  },
  {
    name: "Necklace2",
    src: necklace2,
  },
];

const VirtualTryOn = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [glassesMesh, setGlassesMesh] = useState(null);
  const [necklaceMesh, setNecklaceMesh] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGlass, setSelectedGlass] = useState(null);
  const [selectedNecklace, setSelectedNecklace] = useState(null);
  const [selectedAccessoryType, setSelectedAccessoryType] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Camera Access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }

        // TensorFlow Model
        await tf.setBackend("webgl");
        const loadedModel = await faceLandmarksDetection.load(
          faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
          { shouldLoadIrisModel: true, maxFaces: 1 }
        );
        setModel(loadedModel);

        // Three.js Setup
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75,
          width / height,
          0.1,
          1000
        );
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setAnimationLoop(() => renderer.render(scene, camera));

        // Load Glasses Mesh
        const textureLoader = new THREE.TextureLoader();
        if (selectedGlass !== null) {
          textureLoader.load(selectedGlass, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const geometry = new THREE.PlaneGeometry(2, 1);
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
            });
            const glasses = new THREE.Mesh(geometry, material);
            scene.add(glasses);
            setGlassesMesh(glasses);
          });
        }

        // Load Necklace Mesh
        if (selectedNecklace !== null) {
          const textureLoader1 = new THREE.TextureLoader();
          textureLoader1.load(selectedNecklace, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const geometry = new THREE.PlaneGeometry(2, 1);
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
            });
            const necklace = new THREE.Mesh(geometry, material);
            scene.add(necklace);
            setNecklaceMesh(necklace);
          });
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
      }
    };

    loadResources();
  }, [selectedGlass, selectedNecklace]);

  useEffect(() => {
    const detectAndPositionAccessories = async () => {
      if (!webcamRef.current || !model || (!glassesMesh && !necklaceMesh))
        return;
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      const faceEstimates = await model.estimateFaces({ input: video });
      if (faceEstimates.length > 0) {
        setIsLoading(false);
        // Face mesh keypoints
        const keypoints = faceEstimates[0].scaledMesh;
        const leftEye = keypoints[130];
        const rightEye = keypoints[359];
        const eyeCenter = keypoints[168];
        const chin = keypoints[152];

        // Eye distance for glasses scaling
        const eyeDistance = Math.sqrt(
          Math.pow(rightEye[0] - leftEye[0], 2) +
            Math.pow(rightEye[1] - leftEye[1], 2)
        );
        const scaleMultiplier = eyeDistance / 140;

        // Accessory scaling and offset values
        const scaleX = -0.01;
        const scaleY = -0.01;
        const offsetX = 0.0;
        const offsetY = -0.01;

        if (glassesMesh) {
          // Glasses positioning
          glassesMesh.position.x =
            (eyeCenter[0] - video.videoWidth / 2) * scaleX + offsetX;
          glassesMesh.position.y =
            (eyeCenter[1] - video.videoHeight / 2) * scaleY + offsetY;
          glassesMesh.scale.set(
            scaleMultiplier,
            scaleMultiplier,
            scaleMultiplier
          );
          glassesMesh.position.z = 1;

          // Rotate glasses to align with eyes - rotation depth
          const eyeLine = new THREE.Vector2(
            rightEye[0] - leftEye[0],
            rightEye[1] - leftEye[1]
          );
          const rotationZ = Math.atan2(eyeLine.y, eyeLine.x);
          glassesMesh.rotation.z = rotationZ;
        }

        if (necklaceMesh) {
          // Necklace positioning
          necklaceMesh.position.x = (chin[0] - video.videoWidth / 2) * scaleX;
          necklaceMesh.position.y =
            (chin[1] - video.videoHeight / 2) * scaleY - 0.5; // Adjust for better positioning
          necklaceMesh.scale.set(
            scaleMultiplier,
            scaleMultiplier,
            scaleMultiplier
          );
          necklaceMesh.position.z = 1;
        }
      }
    };

    // Run detection and positioning every 120ms
    const intervalId = setInterval(() => {
      detectAndPositionAccessories();
    }, 120);

    return () => clearInterval(intervalId);
  }, [model, glassesMesh, necklaceMesh]);

  const handleAccessorySelection = (type, src) => {
    setSelectedAccessoryType(type);
    if (type === "glasses") {
      setSelectedGlass(src);
    }
    if (type === "necklace") {
      setSelectedNecklace(src);
    }
  };
  const handleNullAccessorySelection = (type, src) => {
    setSelectedAccessoryType(type);
    if (type === "glasses") {
      setSelectedGlass(null);
    }
    if (type === "necklace") {
      setSelectedNecklace(null);
      loadResources();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginRight: "20px",
        }}
      >
        <div
          className="h-12 w-12 rounded-full relative"
          onClick={() => handleNullAccessorySelection("glasses", null)}
          style={{
            border: selectedGlass === null ? "2px solid red" : "none",
            marginBottom: "10px",
          }}
        >
          <span>Disable Glasses</span>
        </div>
        {glassesList.map((item, index) => (
          <div
            key={index}
            className="h-12 w-12 rounded-full relative"
            onClick={() => handleAccessorySelection("glasses", item.src)}
            style={{
              border: selectedGlass === item.src ? "2px solid red" : "none",
              marginBottom: "10px",
            }}
          >
            <img
              src={item.src}
              alt={item.name}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        ))}

        <div
          className="h-12 w-12 rounded-full relative"
          onClick={() => handleNullAccessorySelection("necklace", null)}
          style={{
            border: selectedNecklace === null ? "2px solid red" : "none",
            marginBottom: "10px",
          }}
        >
          <span>Disable Necklace</span>
        </div>
        {necklaceList.map((item, index) => (
          <div
            key={index}
            className="h-12 w-12 rounded-full relative"
            onClick={() => handleAccessorySelection("necklace", item.src)}
            style={{
              border: selectedNecklace === item.src ? "2px solid red" : "none",
              marginBottom: "10px",
            }}
          >
            <img
              src={item.src}
              alt={item.name}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: "800px", height: "800px" }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            <h3>Loading...</h3>
          </div>
        )}
        <Webcam
          ref={webcamRef}
          autoPlay
          playsInline
          style={{ width: "800px", height: "800px" }}
          mirrored={true}
        />
        <canvas
          ref={canvasRef}
          style={{
            width: "800px",
            height: "800px",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>
    </div>
  );
};

export default VirtualTryOn;
