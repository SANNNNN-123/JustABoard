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
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.2} />
    </mesh>
    <Grid 
      args={[20, 20]} 
      position={[0, 0, 0]}
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
        position={position}
        rotation={[
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ]}
        colliders="cuboid"
        restitution={0.01} // Reduced bounciness
        friction={1.0}    // Increased friction
        mass={2.0}        // Increased mass
        linearDamping={0.25} // Added damping to slow down movement
        angularDamping={0.25} // Added damping to slow down rotation
      >
        <mesh 
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
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
        camera={{ position: [0, 10, 15], fov: 15 }}
        style={{ background: '#A3A3A3' }}
      >
        <Scene />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/tools_pack.glb');

export default ModelTest;