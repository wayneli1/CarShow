import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import TeslaModel from './TeslaModel';
import { CameraControls } from './CameraControls';

export function BasicCar() {
  const [carColor, setCarColor] = useState('#ffffff');
  const [selectedPart, setSelectedPart] = useState(null);
  const [isInCockpit, setIsInCockpit] = useState(false);

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#f0f0f0'
    }}>
      <Canvas 
        camera={{ position: [8, 3, 8], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={1}
          />

          <TeslaModel 
            color={carColor}
            onPartClick={setSelectedPart}
          />
          
          <Environment preset="city" />
          
          <OrbitControls
            enabled={!isInCockpit}
            minDistance={5}
            maxDistance={20}
          />

          <CameraControls 
            onEnterCockpit={() => setIsInCockpit(true)}
            onExitCockpit={() => setIsInCockpit(false)}
          />
        </Suspense>
      </Canvas>
    
      {/* 颜色控制面板 */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <label>
          车身颜色：
          <input 
            type="color" 
            value={carColor}
            onChange={(e) => setCarColor(e.target.value)}
            style={{ marginLeft: '10px', cursor: 'pointer' }}
          />
        </label>

        {selectedPart && (
          <div style={{ 
            marginTop: '10px',
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px'
          }}>
            <h4 style={{ margin: '0 0 8px 0' }}>选中部件信息：</h4>
            <p style={{ margin: '4px 0' }}>名称: {selectedPart.name}</p>
            <p style={{ margin: '4px 0' }}>材质: {selectedPart.materialName}</p>
          </div>
        )}
      </div>

      {/* 驾驶室视角切换按钮 */}
      <button
        style={{
          position: 'absolute',
          right: '20px',
          bottom: '20px',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
        onClick={() => {
          const event = new CustomEvent('toggleCockpitView');
          window.dispatchEvent(event);
        }}
      >
        {isInCockpit ? '退出驾驶室' : '进入驾驶室'}
      </button>
    </div>
  );
}

export default BasicCar;