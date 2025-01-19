import React from 'react';

export function PartInfo({ part }) {
  if (!part) return null;

  return (
    <div style={{ 
      marginTop: '10px',
      padding: '10px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '4px'
    }}>
      <h4 style={{ margin: '0 0 8px 0' }}>选中部件信息：</h4>
      <p style={{ margin: '4px 0' }}>名称: {part.name}</p>
      <p style={{ margin: '4px 0' }}>材质: {part.materialName}</p>
      <p style={{ margin: '4px 0' }}>
        位置: X:{part.position.x.toFixed(2)}, 
        Y:{part.position.y.toFixed(2)}, 
        Z:{part.position.z.toFixed(2)}
      </p>
    </div>
  );
}