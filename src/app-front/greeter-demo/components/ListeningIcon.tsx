// ListeningIcon.js
import React, { memo } from 'react';
import './IconComponent.css';

const ListeningIcon = memo(({ isActive }: { isActive: boolean }) => {
  return (
    <i
      className={`fas fa-headphones icon ${isActive ? 'active' : 'inactive'}`}
      title="Listening"
    ></i>
  );
});

export default ListeningIcon;
