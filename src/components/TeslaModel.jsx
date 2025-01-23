import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WheelControls } from './WheelControls';


// 定义各个组的部件配置
const PART_GROUPS = {
  leftFront: {
    door: 'Model_Y_1047',    // 左前门
    handle: 'Model_Y_1063',  // 左前门把手{ color, onPartClick, wheelsSpinning = false }
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
  },
  trunk: {
    door: 'Model_Y_1008',    // 后备箱主体
    extras: [                // 后备箱相关组件
      'Model_Y_1027',
      'Model_Y_1021',
      'Model_Y_1023',
      'Model_Y_1020',
      'Model_Y_1011',
      'Model_Y_1015',
      'Model_Y_1019',
      'Model_Y_1017',
      'Model_Y_1018',
      'Model_Y_851',
      'Model_Y_1016',
      'Model_Y_1024',
      'Model_Y_1022'
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
  },
  trunk: { 
    open: { rotationX: Math.PI / 4, positionY: -0.7, positionZ: -1.5 },
    closed: { rotationX: 0, positionY: 0, positionZ: 0 }
  }
};
export default function TeslaModel({ color, onPartClick,wheelsSpinning = false }) {
  const { scene } = useGLTF('/Tesla Model Y 2022.glb');
  const groupRefs = {
    leftFront: useRef(new THREE.Group()),
    leftRear: useRef(new THREE.Group()),
    rightFront: useRef(new THREE.Group()),
    rightRear: useRef(new THREE.Group()),
    trunk: useRef(new THREE.Group())
  };

  const [doorStates, setDoorStates] = useState({
    leftFront: { isAnimating: false, isOpen: false },
    leftRear: { isAnimating: false, isOpen: false },
    rightFront: { isAnimating: false, isOpen: false },
    rightRear: { isAnimating: false, isOpen: false },
    trunk: { isAnimating: false, isOpen: false }
  });

  // 动画更新函数
  useFrame(() => {
    Object.entries(groupRefs).forEach(([groupName, ref]) => {
      const state = doorStates[groupName];
      if (state.isAnimating) {
        const group = ref.current;
        const targetConfig = DOOR_CONFIGS[groupName][state.isOpen ? 'open' : 'closed'];
        
        // 更新旋转（支持 X 轴和 Y 轴）
        if (targetConfig.rotationX !== undefined) {
          group.rotation.x += (targetConfig.rotationX - group.rotation.x) * ANIMATION_SPEED;
        }
        if (targetConfig.rotationY !== undefined) {
          group.rotation.y += (targetConfig.rotationY - group.rotation.y) * ANIMATION_SPEED;
        }
        
        // 更新位置
        if (targetConfig.positionX !== undefined) {
          group.position.x += (targetConfig.positionX - group.position.x) * ANIMATION_SPEED;
        }
        if (targetConfig.positionY !== undefined) {
          group.position.y += (targetConfig.positionY - group.position.y) * ANIMATION_SPEED;
        }
        if (targetConfig.positionZ !== undefined) {
          group.position.z += (targetConfig.positionZ - group.position.z) * ANIMATION_SPEED;
        }
        
        // 检查动画是否完成
        const isComplete = Object.entries(targetConfig).every(([key, value]) => {
          if (key.startsWith('rotation')) {
            return Math.abs(group.rotation[key.slice(-1).toLowerCase()] - value) < 0.01;
          }
          if (key.startsWith('position')) {
            return Math.abs(group.position[key.slice(-1).toLowerCase()] - value) < 0.01;
          }
          return true;
        });

        if (isComplete) {
          // 设置精确的最终位置
          Object.entries(targetConfig).forEach(([key, value]) => {
            if (key.startsWith('rotation')) {
              group.rotation[key.slice(-1).toLowerCase()] = value;
            }
            if (key.startsWith('position')) {
              group.position[key.slice(-1).toLowerCase()] = value;
            }
          });
          
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
    const globalAxesHelper = new THREE.AxesHelper(5);
    scene.add(globalAxesHelper);

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
    Object.values(groupRefs).forEach(ref => {
      if (ref.current.parent) {
        ref.current.parent.remove(ref.current);
      }
    });

    Object.entries(PART_GROUPS).forEach(([groupName, parts]) => {
      const group = groupRefs[groupName].current;
      group.name = groupName;

      const doorMesh = scene.getObjectByName(parts.door);
      const handleMesh = scene.getObjectByName(parts.handle);
      const windowMesh = scene.getObjectByName(parts.window);

      if (doorMesh) {
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

        scene.add(group);

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
      <WheelControls scene={scene} isSpinning={wheelsSpinning} />

    </group>
  );
}

// 预加载模型
useGLTF.preload('/Tesla Model Y 2022.glb');