import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DragControls } from 'three/addons/controls/DragControls.js';

const Tools = ({ scene, camera, renderer }) => {
  const objects = useRef([]);
  const dragControlsRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    // Create a group for tools
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Tool name mapping for identification
    const toolNames = [
      'turnscrew2',
      'turnscrew',
      'wrench',
      'knife',
      'roulette',
      'insulatingtape',
      'pliers'
    ];

    // Model loading
    const assetLoader = new GLTFLoader();
    assetLoader.load(
      '/tools_pack.glb',
      function(gltf) {
        const model = gltf.scene;
        
        model.scale.set(0.1, 0.1, 0.1);
        model.rotation.x = Math.PI / 2;
        model.position.set(1, 0, 0);

        // Process meshes and add to objects array
        model.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Find and tag specific tools
            toolNames.forEach(toolName => {
              if (child.name.toLowerCase().includes(toolName)) {
                child.userData.isDraggable = true;
                child.userData.toolType = toolName;
                objects.current.push(child);
              }
            });
          }
        });

        group.add(model);

        // Initialize DragControls with objects array
        const controls = new DragControls(objects.current, camera, renderer.domElement);
        controls.rotateSpeed = 4;
        dragControlsRef.current = controls;

        // Event listeners
        controls.addEventListener('dragstart', function (event) {
          renderer.domElement.style.cursor = 'grabbing';
          event.object.userData.originalPosition = event.object.position.clone();
        });

        controls.addEventListener('drag', function (event) {
          // Maintain z-position during drag
          event.object.position.z = event.object.userData.originalPosition.z;
        });

        controls.addEventListener('dragend', function () {
          renderer.domElement.style.cursor = 'auto';
        });

        controls.addEventListener('hoveron', function () {
          renderer.domElement.style.cursor = 'grab';
        });

        controls.addEventListener('hoveroff', function () {
          renderer.domElement.style.cursor = 'auto';
        });

        // Add event listener for shift key to enable/disable controls
        const onKeyDown = (event) => {
          if (event.keyCode === 16) { // Shift key
            controls.enabled = false;
          }
        };

        const onKeyUp = (event) => {
          if (event.keyCode === 16) { // Shift key
            controls.enabled = true;
          }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Cleanup function
        return () => {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
        };
      },
      undefined,
      function(error) {
        console.error('Error loading tools model:', error);
      }
    );

    return () => {
      if (groupRef.current) {
        scene.remove(groupRef.current);
      }
      if (dragControlsRef.current) {
        dragControlsRef.current.dispose();
      }
      objects.current = [];
    };
  }, [scene, camera, renderer]);

  return null;
};

export default Tools;