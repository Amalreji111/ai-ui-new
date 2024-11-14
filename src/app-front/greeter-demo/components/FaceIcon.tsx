// FaceIcon.js
import React, { memo } from 'react';
import './IconComponent.css';

const FaceIcon = memo(({ isActive }: { isActive: boolean }) => {
  return (
    <i
      className={`fas fa-user icon ${isActive ? 'active' : 'inactive'}`}
      title="Face"
    ></i>
  );
});

export default FaceIcon;
