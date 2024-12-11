// FaceIcon.js
import React, { memo } from 'react';
import './IconComponent.css';

const FaceIcon = memo(({ isActive }: { isActive: boolean }) => {
  return (
    <i className="bi bi-person-bounding-box"
    style={{
      fontSize: "40px",
      color: isActive ? 'green' : 'red'
    }}
    ></i>
  );
});

export default FaceIcon;
