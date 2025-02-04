import React, { useRef, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const FallbackBox = ({ position }) => (
  <RigidBody position={position} colliders="cuboid">
    <mesh castShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="red" />
    </mesh>
  </RigidBody>
);

const Ground = () => (
  <RigidBody type="fixed" friction={1}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -3, 2]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.2} />
    </mesh>
    <Grid 
      args={[10, 10]} 
      position={[0, -3, 2]}
      cellSize={1}
      cellThickness={1}
      cellColor="#6f6f6f"
      sectionSize={5}
      sectionThickness={1.5}
      sectionColor="#9d4b4b"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
    />
  </RigidBody>
);

const Tool = ({ name, position, scene }) => {
  const meshRef = useRef();
  const rigidBodyRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(false);
  let meshData;
  try {
    scene.traverse((child) => {
      if (child.isMesh && child.name.toLowerCase().includes(name.toLowerCase())) {
        meshData = child;
      }
    });

    if (!meshData) {
      console.warn(`Mesh "${name}" not found in scene`);
      return <FallbackBox position={position} />;
    }

    const geometry = meshData.geometry.clone();
    const material = meshData.material.clone();

    // Scale the geometry up
    const scale = new THREE.Vector3(6, 6, 6);
    geometry.scale(scale.x, scale.y, scale.z);

    return (
      <RigidBody 
        ref={rigidBodyRef}
        position={position}
        rotation={[
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ]}
        colliders="cuboid"
        restitution={0.01}
        friction={1.0}
        mass={2.0}
        linearDamping={0.25}
        angularDamping={0.25}
        enabledRotations={[!isDragging, !isDragging, !isDragging]}
      >
        <mesh 
          ref={meshRef}
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsDragging(true);
            document.body.style.cursor = 'grabbing';
          }}
          onPointerUp={() => {
            setIsDragging(false);
            document.body.style.cursor = 'auto';
          }}
          onPointerMove={(e) => {
            if (isDragging) {
              e.stopPropagation();
              const { point } = e;
              rigidBodyRef.current.setTranslation({ 
                x: point.x, 
                y: point.y, 
                z: point.z 
              });
              rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
            }
          }}
        />
      </RigidBody>
    );
  } catch (err) {
    console.error(`Error creating tool ${name}:`, err);
    return <FallbackBox position={position} />;
  }
};

const Tools = () => {
  const { scene } = useGLTF('/tools_pack.glb');
  const toolNames = [
    'turnscrew2', 'turnscrew', 'wrench', 'knife', 
    'roulette', 'insulatingtape', 'pliers'
  ];

  return (
    <>
      {toolNames.map((name, index) => (
        <Tool
          key={name}
          name={name}
          scene={scene}
          position={[
            Math.random() * 2 - 1,  // Reduced spread (-1 to 1)
            5 + Math.random() * 2, // Keep height the same (20-22)
            Math.random() * 2 - 1   // Reduced spread (-1 to 1)
          ]}
        />
      ))}
    </>
  );
};

const PegBoard = () => {
  const { scene } = useGLTF('/a_peg_board.glb');
  
  const removeObjectsWithDefaultMaterial = (object) => {
    for (let i = object.children.length - 1; i >= 0; i--) {
      removeObjectsWithDefaultMaterial(object.children[i]);
    }

    if (object.isMesh && 
        object.material && 
        (object.material.name === 'defaultMaterial' || 
        object.material.name === 'defaultMaterial_3' ||
        object.material.name === 'defaultMaterial_4' ||
        object.name === 'defaultMaterial' ||
        object.name === 'defaultMaterial_3' ||
        object.name === 'defaultMaterial_4' )) {
      
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
      if (object.parent) object.parent.remove(object);
    }
  };

  // Clone the scene to avoid modifying the cached original
  const clonedScene = scene.clone();
  removeObjectsWithDefaultMaterial(clonedScene);

  return (
    <RigidBody type="fixed" position={[0, 0, -3]}>
      <primitive object={clonedScene} scale={[3, 3, 3]} />
    </RigidBody>
  );
};

const Scene = () => {
  return (
    <Physics 
      debug={false} 
      gravity={[0, -6, 0]}
      timeStep="vary"
      paused={false}
      interpolate={true}
    >
      <Ground />
      <Suspense fallback={null}>
        <Tools />
        <PegBoard />
      </Suspense>

      <ambientLight intensity={1.5} />
      <hemisphereLight
        intensity={0.8}
        color="#ffffff"
        groundColor="#b9b9b9"
      />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </Physics>
  );
};

function ModelTest() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 40 }}
        style={{ background: '#A3A3A3' }}
      >
        <Scene />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={30}
          enableRotate={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/tools_pack.glb');
useGLTF.preload('/a_peg_board.glb');

export default ModelTest;