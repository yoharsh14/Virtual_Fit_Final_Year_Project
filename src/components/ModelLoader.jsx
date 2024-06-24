import React from "react";
import { useGLTF, useTexture } from "@react-three/drei";

const ModelLoader = ({ texture, modelLocation, materialPty }) => {

  // console.log(materialPty)
  const { scene, nodes, materials } = useGLTF(`${modelLocation}`);
  console.log(materials)
  const fullTexture = useTexture(texture);

  const shirtMaterial = materials[materialPty];

  if (shirtMaterial) {
    shirtMaterial.map = fullTexture;
    shirtMaterial.needsUpdate = true; 
  }

  return (
    <group>
      <mesh castShadow receiveShadow>
        <primitive object={scene} />
      </mesh>
    </group>
  );
};

export default ModelLoader;
