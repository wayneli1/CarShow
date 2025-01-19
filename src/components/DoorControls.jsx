import React from 'react';

export function DoorControls({ doorsState, onToggleAll, onToggleDoor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={onToggleAll}
        style={{
          padding: '8px 16px',
          background: Object.values(doorsState).some(state => state) 
            ? 'rgba(255,255,255,0.2)' 
            : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        {Object.values(doorsState).some(state => state) ? '关闭所有车门' : '打开所有车门'}
      </button>
      
      {Object.entries(doorsState).map(([doorType, isOpen]) => (
        <button
          key={doorType}
          onClick={() => onToggleDoor(doorType)}
          style={{
            padding: '8px',
            background: isOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isOpen ? '关闭' : '打开'} {
            doorType === 'leftFront' ? '左前门' :
            doorType === 'leftRear' ? '左后门' :
            doorType === 'rightFront' ? '右前门' : '右后门'
          }
        </button>
      ))}
    </div>
  );
}