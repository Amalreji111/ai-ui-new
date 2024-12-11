// FaceIcon.js
import React, { memo } from 'react';
import './IconComponent.css';

const FaceIcon = memo(({ isActive }: { isActive: boolean }) => {
  return (
    <i className="bi bi-person-bounding-box"
    style={{
      fontSize: "40px",
      color: isActive ? '#00ff00 ' : 'rgb(255, 238, 0)'
    }}
    ></i>
  );
});

export default FaceIcon;
