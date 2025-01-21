import { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraControls({ onEnterCockpit, onExitCockpit }) {
  const { camera } = useThree();
  const [isInCockpit, setIsInCockpit] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const currentRotationX = useRef(0);

  const cameraPositions = {
    outside: {
      position: new THREE.Vector3(8, 3, 8),
      target: new THREE.Vector3(0, 0, 0)
    },
    cockpit: {
      position: new THREE.Vector3(0, 1.2, -0.7),
      target: new THREE.Vector3(0, 0, 3)
    }
  };

  // 只在驾驶室内时启用鼠标控制
  useEffect(() => {
    if (!isInCockpit || isAnimating) return;

    const handleMouseDown = (e) => {
      isDragging.current = true;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
    };

    const handleMouseMove = (e) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMouseX.current;
        const deltaY = e.clientY - lastMouseY.current;

        camera.rotateY(-deltaX * 0.005);

        const newRotationX = currentRotationX.current - deltaY * 0.005;
        const clampedRotationX = Math.max(-Math.PI/4, Math.min(Math.PI/4, newRotationX));
        const rotationDelta = clampedRotationX - currentRotationX.current;
        camera.rotateX(rotationDelta);
        currentRotationX.current = clampedRotationX;

        lastMouseX.current = e.clientX;
        lastMouseY.current = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // 只在驾驶室内添加事件监听
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isInCockpit, isAnimating, camera]);

  useEffect(() => {
    const handleToggle = () => {
      setIsInCockpit(prev => !prev);
      setIsAnimating(true);
      
      if (!isInCockpit) {
        onEnterCockpit?.();
        currentRotationX.current = 0;
      } else {
        // 退出驾驶室时重置相机旋转
        camera.rotation.set(0, 0, 0);
        currentRotationX.current = 0;
        onExitCockpit?.();
      }
    };

    window.addEventListener('toggleCockpitView', handleToggle);
    return () => window.removeEventListener('toggleCockpitView', handleToggle);
  }, [isInCockpit, onEnterCockpit, onExitCockpit, camera]);

  useFrame(() => {
    if (isAnimating) {
      const targetPos = isInCockpit ? cameraPositions.cockpit : cameraPositions.outside;
      const targetLookAt = isInCockpit ? cameraPositions.cockpit.target : cameraPositions.outside.target;

      camera.position.lerp(targetPos.position, 0.05);
      
      // 只在动画过程中控制朝向
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      const targetDirection = targetLookAt.clone().sub(camera.position).normalize();
      const newDirection = currentLookAt.lerp(targetDirection, 0.05);
      camera.lookAt(camera.position.clone().add(newDirection));

      if (camera.position.distanceTo(targetPos.position) < 0.1) {
        setIsAnimating(false);
      }
    }
  });

  return null;
}