// FaceIcon.js
import React, { memo } from 'react';
import './IconComponent.css';

const CameraIcon = memo(({ isActive }: { isActive: boolean }) => {
  return (
    <i
      className={`fas fa-camera icon ${isActive ? 'active' : 'inactive'}`}
      title="Camera"
    ></i>
  );
});

export default CameraIcon;
