// FaceIcon.js
import React, { memo } from 'react';
import './IconComponent.css';

const CameraIcon = memo(({ isActive }: { isActive: boolean }) => {
  return (
<i className="bi bi-camera"
style={{
  fontSize: "40px",
  color: isActive ? 'green' : 'red'
}}></i>
  );
});

export default CameraIcon;
