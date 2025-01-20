import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
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

export default function TeslaModel({ color, onPartClick }) {
  const { scene } = useGLTF('/Tesla Model Y 2022.glb');
  const groupRefs = {
    leftFront: useRef(new THREE.Group()),
    leftRear: useRef(new THREE.Group()),
    rightFront: useRef(new THREE.Group()),
    rightRear: useRef(new THREE.Group())
  };

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
        // 打印每个门的初始位置和旋转
        console.log(`${groupName} initial position:`, doorMesh.position);
        console.log(`${groupName} initial rotation:`, doorMesh.rotation);

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

  // 修改点击事件，添加位置和旋转的打印
  const handleClick = (event) => {
    event.stopPropagation();
    const clickedMesh = event.object;
    const groupName = clickedMesh.parent?.name;

    if (groupName && groupRefs[groupName]) {
      const group = groupRefs[groupName].current;
      const currentRotation = group.rotation;
      const isOpen = Math.abs(currentRotation.y) > 0.1;
      
      // 打印当前状态
      console.log(`${groupName} before click:`, {
        position: group.position,
        rotation: group.rotation,
        isOpen: isOpen
      });

      // 设置新的旋转和平移
      if (isOpen) {
        // 关闭状态：恢复初始位置和旋转
        group.rotation.y = 0;
        group.position.x = 0;
        group.position.z = 0;
      } else {
        // 打开状态：旋转并平移
        const rotationMap = {
          leftFront: { 
            rotationY: -Math.PI / 4, 
            positionX: 0.8, 
            positionZ: -0.5 
          },
          leftRear: { 
            rotationY: -Math.PI / 4, 
            positionX: -0.05, 
            positionZ: -0.85 
          },
          rightFront: { 
            rotationY: Math.PI / 4, 
            positionX: -0.8, 
            positionZ: -0.5 
          },
          rightRear: { 
            rotationY: Math.PI / 4, 
            positionX: 0.05, 
            positionZ: -0.85 
          }
        };

        const doorConfig = rotationMap[groupName];
        group.rotation.y = doorConfig.rotationY;
        group.position.x = doorConfig.positionX;
        group.position.z = doorConfig.positionZ;
      }

      // 打印更新后的状态
      console.log(`${groupName} after click:`, {
        position: group.position,
        rotation: group.rotation,
        newRotation: group.rotation.y
      });
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