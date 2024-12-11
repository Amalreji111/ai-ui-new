// ListeningIcon.js
import React, { memo } from 'react';
import './IconComponent.css';

const ListeningIcon = memo(({ isActive }: { isActive: boolean }) => {
  return (
    // <i
    //   className={`fas fa-headphones icon ${isActive ? 'active' : 'inactive'}`}
    //   title="Listening"
    // ></i>
    <i className={`bi bi-mic-fill  `} style={{
      fontSize: "40px",
      color: isActive ? '#00ff00 ' : 'rgb(255, 238, 0)'
    }}></i>
  );
});

export default ListeningIcon;
