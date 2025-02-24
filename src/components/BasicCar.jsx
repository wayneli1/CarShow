import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress } from '@react-three/drei';
import { Sun, Moon } from 'lucide-react';
import TeslaModel from './TeslaModel';
import { CameraControls } from './CameraControls';

function Loader() {
 const { progress } = useProgress();
 return null;
}

function LoadingScreen() {
 const { progress, active } = useProgress();
 
 if (!active) return null;
 
 return (
   <div style={{
     position: 'absolute',
     top: '50%',
     left: '50%',
     transform: 'translate(-50%, -50%)',
     textAlign: 'center',
     zIndex: 100
   }}>
     <div style={{
       width: '200px',
       height: '6px',
       background: '#444',
       borderRadius: '3px',
       overflow: 'hidden'
     }}>
       <div style={{
         width: `${progress}%`,
         height: '100%',
         background: '#fff',
         transition: 'width 0.3s ease'
       }} />
     </div>
     <div style={{ 
       color: '#000', 
       marginTop: '10px',
       fontSize: '14px' 
     }}>
       加载中... {progress.toFixed(0)}%
     </div>
   </div>
 );
}

export function BasicCar() {
 const [carColor, setCarColor] = useState('#ffffff');
 const [isInCockpit, setIsInCockpit] = useState(false);
 const [wheelsSpinning, setWheelsSpinning] = useState(false);
 const [isDaylight, setIsDaylight] = useState(false);

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
     <LoadingScreen />
     <Canvas
       camera={{ position: [8, 3, 8], fov: 50 }}
       shadows
     >
       <Suspense fallback={<Loader />}>
         <ambientLight intensity={0.7} />
         <spotLight
           position={[10, 10, 10]}
           angle={0.15}
           penumbra={1}
           intensity={1}
         />

         <TeslaModel
           color={carColor}
           wheelsSpinning={wheelsSpinning}
         />
         
         <Environment files={isDaylight ? "daylight.hdr" : "solitude_night_4k.hdr"} background />
         
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
     </div>

     <button 
       style={{
         position: 'absolute',
         right: '20px',
         top: '20px',
         width: '44px',
         height: '44px',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         background: 'rgba(0, 0, 0, 0.7)',
         color: '#fff',
         border: 'none',
         borderRadius: '50%',
         cursor: 'pointer',
         padding: '8px'
       }}
       onClick={() => setIsDaylight(!isDaylight)}
     >
       {isDaylight ? <Moon size={20} /> : <Sun size={20} />}
     </button>

     <button
       style={{
         position: 'absolute',
         right: '20px',
         bottom: '80px',
         padding: '10px 20px',
         background: 'rgba(0, 0, 0, 0.7)',
         color: 'white',
         border: 'none',
         borderRadius: '5px',
         cursor: 'pointer',
         fontSize: '14px'
       }}
       onClick={() => setWheelsSpinning(!wheelsSpinning)}
     >
       {wheelsSpinning ? '停止后轮驱动' : '开始后轮驱动'}
     </button>

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