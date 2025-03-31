// File is in progress and not fully functional yet.
// This file is intended to be used with React and Next.js

// 'use client'; // For Next.js

import React, { useEffect, useRef, useState } from 'react';
import { initPxlNav, getPxlNav } from './pxlNavBridge';
import { pxlOptions, pxlUserSettings } from './pxlNav';

export default function PxlNavContainer({ projectTitle = "pxlNav" }) {
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Create div for pxlNav to target
    const coreDiv = document.createElement('div');
    coreDiv.id = 'pxlNav-coreCanvas';
    document.body.appendChild(coreDiv);
    
    // Configure and initialize pxlNav
    const options = {...pxlOptions};
    options.userSettings = {...pxlUserSettings};
    
    const pxlNavInstance = initPxlNav(
      options, 
      projectTitle,
      "DefaultRoom",
      ["DefaultRoom"]
    );
    
    // Let React know initialization is complete
    pxlNavInstance.subscribe('booted', () => {
      setIsInitialized(true);
    });
    
    // Cleanup
    return () => {
      // Optional: Implement cleanup if needed
      // This depends on whether you need to destroy pxlNav instance
    };
  }, [projectTitle]);
  
  return (
    <div className="pxlnav-react-container">
      {/* Canvas is managed by Three.js directly */}
      <div id="pxlNav-coreCanvas-container" />
      
      {/* React-based UI components */}
      {isInitialized && <PxlNavHUD />}
    </div>
  );
}