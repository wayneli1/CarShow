import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 定义各个组的部件配置
const PART_GROUPS = {
  leftFront: {
    door: 'Model_Y_1047',    // 左前门
    handle: 'Model_Y_1063',  // 左前门把手
    window: 'Model_Y_1061',  // 左前窗户
    extras: [                // 使用数组存储所有额外组件
      'Model_Y_1062',
      'Model_Y_1054',
      'Model_Y_1049',
      'Model_Y_1059',
      'Model_Y_1056',
      'Model_Y_1053',
      'Model_Y_1058',
      'Model_Y_1057',
      'Model_Y_1050',
      'Model_Y_1055'
    ]
  },
  leftRear: {
    door: 'Model_Y_1035',
    handle: 'Model_Y_1040',
    window: 'Model_Y_1041',
    extras: [
      'Model_Y_1043',
      'Model_Y_1038',
      'Model_Y_1037',
      'Model_Y_1036',
      'Model_Y_1042'
    ]
  },
  rightFront: {
    door: 'Model_Y_981',
    handle: 'Model_Y_995',
    window: 'Model_Y_989',
    extras: [
      'Model_Y_992',
      'Model_Y_984',
      'Model_Y_991',
      'Model_Y_985',
      'Model_Y_983',
      'Model_Y_990',
      'Model_Y_987',
      'Model_Y_988',
      'Model_Y_986',
      'Model_Y_982'
    ]
  },
  rightRear: {
    door: 'Model_Y_998',
    handle: 'Model_Y_999',
    window: 'Model_Y_1004',
    extras: [
      'Model_Y_1006',
      'Model_Y_1002',
      'Model_Y_1000',
      'Model_Y_1003'
    ]
  }
};

// 动画速度和门的配置
const ANIMATION_SPEED = 0.08;
const DOOR_CONFIGS = {
  leftFront: { 
    open: { rotationY: -Math.PI / 4, positionX: 0.8, positionZ: -0.5 },
    closed: { rotationY: 0, positionX: 0, positionZ: 0 }
  },
  leftRear: { 
    open: { rotationY: -Math.PI / 4, positionX: -0.05, positionZ: -0.85 },
    closed: { rotationY: 0, positionX: 0, positionZ: 0 }
  },
  rightFront: { 
    open: { rotationY: Math.PI / 4, positionX: -0.8, positionZ: -0.5 },
    closed: { rotationY: 0, positionX: 0, positionZ: 0 }
  },
  rightRear: { 
    open: { rotationY: Math.PI / 4, positionX: 0.05, positionZ: -0.85 },
    closed: { rotationY: 0, positionX: 0, positionZ: 0 }
  }
};

export default function TeslaModel({ color, onPartClick }) {
  const { scene } = useGLTF('/Tesla Model Y 2022.glb');
  const groupRefs = {
    leftFront: useRef(new THREE.Group()),
    leftRear: useRef(new THREE.Group()),
    rightFront: useRef(new THREE.Group()),
    rightRear: useRef(new THREE.Group())
  };

  const [doorStates, setDoorStates] = useState({
    leftFront: { isAnimating: false, isOpen: false },
    leftRear: { isAnimating: false, isOpen: false },
    rightFront: { isAnimating: false, isOpen: false },
    rightRear: { isAnimating: false, isOpen: false }
  });

  // 动画更新函数
  useFrame(() => {
    Object.entries(groupRefs).forEach(([groupName, ref]) => {
      const state = doorStates[groupName];
      if (state.isAnimating) {
        const group = ref.current;
        const targetConfig = DOOR_CONFIGS[groupName][state.isOpen ? 'open' : 'closed'];
        
        // 更新旋转
        group.rotation.y += (targetConfig.rotationY - group.rotation.y) * ANIMATION_SPEED;
        
        // 更新位置
        group.position.x += (targetConfig.positionX - group.position.x) * ANIMATION_SPEED;
        group.position.z += (targetConfig.positionZ - group.position.z) * ANIMATION_SPEED;
        
        // 检查动画是否完成
        if (
          Math.abs(group.rotation.y - targetConfig.rotationY) < 0.01 &&
          Math.abs(group.position.x - targetConfig.positionX) < 0.01 &&
          Math.abs(group.position.z - targetConfig.positionZ) < 0.01
        ) {
          // 设置精确的最终位置
          group.rotation.y = targetConfig.rotationY;
          group.position.x = targetConfig.positionX;
          group.position.z = targetConfig.positionZ;
          
          setDoorStates(prev => ({
            ...prev,
            [groupName]: { ...prev[groupName], isAnimating: false }
          }));
        }
      }
    });
  });

  // 添加调试功能
  useEffect(() => {
    // 添加全局坐标轴辅助器
    const globalAxesHelper = new THREE.AxesHelper(5);
    scene.add(globalAxesHelper);

    // 为每个车门组添加局部坐标轴辅助器
    Object.entries(groupRefs).forEach(([groupName, ref]) => {
      const localAxesHelper = new THREE.AxesHelper(1);
      ref.current.add(localAxesHelper);
    });
  }, [scene]);

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

    Object.entries(PART_GROUPS).forEach(([groupName, parts]) => {
      const group = groupRefs[groupName].current;
      group.name = groupName;

      // 找到对应的部件
      const doorMesh = scene.getObjectByName(parts.door);
      const handleMesh = scene.getObjectByName(parts.handle);
      const windowMesh = scene.getObjectByName(parts.window);

      if (doorMesh) {
        // 将部件添加到组中，保持其原始位置和旋转
        doorMesh.updateMatrix();
        const doorClone = doorMesh.clone();
        group.add(doorClone);

        if (handleMesh) {
          handleMesh.updateMatrix();
          const handleClone = handleMesh.clone();
          group.add(handleClone);
        }

        if (windowMesh) {
          windowMesh.updateMatrix();
          const windowClone = windowMesh.clone();
          group.add(windowClone);
        }

        // 处理额外组件
        if (parts.extras && Array.isArray(parts.extras)) {
          parts.extras.forEach(extraId => {
            const extraMesh = scene.getObjectByName(extraId);
            if (extraMesh) {
              extraMesh.updateMatrix();
              const extraClone = extraMesh.clone();
              group.add(extraClone);
              if (extraMesh.parent) extraMesh.parent.remove(extraMesh);
            }
          });
        }

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
      // 切换门的状态并开始动画
      setDoorStates(prev => ({
        ...prev,
        [groupName]: {
          isAnimating: true,
          isOpen: !prev[groupName].isOpen
        }
      }));
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

// 预加载模型
useGLTF.preload('/Tesla Model Y 2022.glb');