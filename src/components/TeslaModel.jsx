import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 定义各个组的部件配置
const PART_GROUPS = {
  leftFront: {
    door: 'Model_Y_1047',    // 左前门
    handle: 'Model_Y_1063',  // 左前门把手
    window: 'Model_Y_1061'   // 左前窗户
  },
  leftRear: {
    door: 'Model_Y_1035',    // 左后门
    handle: 'Model_Y_1040',  // 左后门把手
    window: 'Model_Y_1041'   // 左后窗户
  },
  rightFront: {
    door: 'Model_Y_981',     // 右前门
    handle: 'Model_Y_995',   // 右前门把手
    window: 'Model_Y_989'    // 右前窗户
  },
  rightRear: {
    door: 'Model_Y_998',     // 右后门
    handle: 'Model_Y_999',   // 右后门把手
    window: 'Model_Y_1004'    // 右后窗户
  }
};

export function TeslaModel({ color, onPartClick }) {
  const { scene } = useGLTF('/Tesla Model Y 2022.glb');
  const groupRefs = {
    leftFront: useRef(new THREE.Group()),
    leftRear: useRef(new THREE.Group()),
    rightFront: useRef(new THREE.Group()),
    rightRear: useRef(new THREE.Group())
  };

  // 更新车身颜色
  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh && node.material.name === 'carpaint') {
        node.material.color.set(color);
      }
    });
  }, [color, scene]);

  // 设置组和部件
  useEffect(() => {
    // 清理旧的组
    Object.values(groupRefs).forEach(ref => {
      if (ref.current.parent) {
        ref.current.parent.remove(ref.current);
      }
    });

    // 为每个组创建一个pivot point
    Object.entries(PART_GROUPS).forEach(([groupName, parts]) => {
      const group = groupRefs[groupName].current;
      group.name = groupName;

      // 找到对应的部件
      const doorMesh = scene.getObjectByName(parts.door);
      const handleMesh = scene.getObjectByName(parts.handle);
      const windowMesh = scene.getObjectByName(parts.window);

      if (doorMesh) {
        // 保存原始世界位置和旋转
        const worldPosition = doorMesh.getWorldPosition(new THREE.Vector3());
        
        // 将部件添加到组中
        group.add(doorMesh.clone());
        if (handleMesh) group.add(handleMesh.clone());
        if (windowMesh) group.add(windowMesh.clone());

        // 设置组的位置
        group.position.copy(worldPosition);

        // 添加组到场景
        scene.add(group);

        // 移除原始部件
        if (doorMesh.parent) doorMesh.parent.remove(doorMesh);
        if (handleMesh?.parent) handleMesh.parent.remove(handleMesh);
        if (windowMesh?.parent) windowMesh.parent.remove(windowMesh);
      }
    });
  }, [scene]);

  // 处理点击事件
  const handleClick = (event) => {
    event.stopPropagation();
    const clickedMesh = event.object;
    const groupName = clickedMesh.parent?.name;

    if (groupName && groupRefs[groupName]) {
      const group = groupRefs[groupName].current;
      const isLeft = groupName.includes('left');
      const currentRotation = group.rotation.y;
      const targetRotation = currentRotation === 0 ? (isLeft ? -Math.PI / 4 : Math.PI / 4) : 0;
      
      group.rotation.y = targetRotation;
    } else {
      onPartClick?.({
        name: clickedMesh.name,
        materialName: clickedMesh.material.name,
        position: clickedMesh.position
      });
    }
  };

  return (
    <group onClick={handleClick}>
      <primitive object={scene} />
    </group>
  );
}