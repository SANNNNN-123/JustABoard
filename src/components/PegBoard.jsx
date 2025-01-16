import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Model() {
  const { scene } = useGLTF('/a_peg_board.glb');
  return <primitive object={scene} />;
}

const PegBoard = () => {
  return (
    <div className="w-full h-screen bg-white">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'white' }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        
        <OrbitControls enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default PegBoard;