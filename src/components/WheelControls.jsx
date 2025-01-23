import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function WheelControls({ scene, isSpinning }) {
  // 后轮的分组
  const wheelGroups = {
    rearLeft: [
      'Model_Y_911' // 后左轮
    ],
    rearRight: [
      'Model_Y_933' // 后右轮
    ]
  };

  // 用于保存每个轮子组的引用
  const groupRefs = useRef({
    rearLeft: new THREE.Group(),
    rearRight: new THREE.Group()
  });

  // 将所有后轮对象加入到对应的组中
  useEffect(() => {
    Object.entries(wheelGroups).forEach(([groupName, partIds]) => {
      const group = groupRefs.current[groupName];
      
      partIds.forEach(id => {
        const part = scene.getObjectByName(id);
        if (part) {
          group.add(part);
        }
      });
      
      scene.add(group);
    });
  }, [scene]);

  // 使用useFrame来控制每一帧的后轮旋转
  useFrame(({ clock }) => {
    if (isSpinning) {
      Object.values(groupRefs.current).forEach(group => {
        // 确保后轮围绕自身的坐标轴旋转，避免全局轴影响
        group.traverse((object) => {
          // 仅对类型为Mesh的对象进行旋转
          if (object instanceof THREE.Mesh) {
            // 旋转每个轮子的local axis (绕自己的局部坐标轴旋转)
            object.rotation.x += 0.05; // 后轮绕x轴旋转
          }
        });
      });
    }
  });

  return null;
}
