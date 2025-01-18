import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Tools from './Tools';

const PegBoard = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xA3A3A3);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup - limited to only zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controlsRef.current = controls;

    // Lights setup
    const lights = {
      ambient: new THREE.AmbientLight(0xededed, 2.2),
      point: new THREE.PointLight(0xFFFFFF, 1.2)
    };

    // Position point light at camera position
    lights.point.position.set(0, 0, 0);
    lights.point.castShadow = true;

    // Add lights to scene
    Object.values(lights).forEach(light => scene.add(light));

    // Model loading
    const assetLoader = new GLTFLoader();
    assetLoader.load(
      '/a_peg_board.glb',
      function(gltf) {
        const model = gltf.scene;

        const removeObjectsWithDefaultMaterial = (object) => {
          for (let i = object.children.length - 1; i >= 0; i--) {
            removeObjectsWithDefaultMaterial(object.children[i]);
          }

          if (object.isMesh && 
              object.material && 
              (object.material.name === 'defaultMaterial' || 
              // object.material.name === 'defaultMaterial_1' ||
              object.material.name === 'defaultMaterial_3' ||
              object.material.name === 'defaultMaterial_4' ||
              object.material.name === 'defaultMaterial_5' ||  
               
              object.name === 'defaultMaterial' ||
              // object.name === 'defaultMaterial_1' ||
              object.name === 'defaultMaterial_3' ||
              object.name === 'defaultMaterial_4' || 
              object.name === 'defaultMaterial_5')) {
            
            if (object.geometry) object.geometry.dispose();
            if (object.material) object.material.dispose();
            if (object.parent) object.parent.remove(object);
          }
        };

        removeObjectsWithDefaultMaterial(model);

        model.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        model.scale.set(5, 5, 5);
        scene.add(model);
        setSceneReady(true);
      },
      undefined,
      function(error) {
        console.error('Error loading model:', error);
      }
    );

    // Animation loop
    function animate() {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
    renderer.setAnimationLoop(animate);

    // Window resize handler
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef}>
      {sceneReady && (
        <Tools 
          scene={sceneRef.current}
          camera={cameraRef.current}
          renderer={rendererRef.current}
        />
      )}
    </div>
  );
};

export default PegBoard;