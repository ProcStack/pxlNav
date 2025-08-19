// File is in progress and not fully functional yet.
// This file is intended to be used with React and Next.js
/*
'use client'; // Next.js specific directive to enable client-side rendering
import { useRef } from 'react';

import React, { useEffect, useState } from 'react';
import { getPxlNav, subscribePxlNav, unsubscribePxlNav } from '../../../utils/pxlNavBridge';

export default function PxlNavHUD() {
  const [hudVisibility, setHudVisibility] = useState( true );
  const [currentRoom, setCurrentRoom] = useState( '' );
  const componentId = useRef( 'hud-' + Math.random().toString(36).substring(2) );
  
  useEffect(() => {
    const pxlNavInstance = getPxlNav();
    if (!pxlNavInstance) return;
    
    // Get initial states
    setHudVisibility( pxlNavInstance.pxlGuiDraws.hudVisibility );
    setCurrentRoom( pxlNavInstance.pxlEnv.currentRoom );

    // Subscribe to changes
    subscribePxlNav( componentId.current, 'roomChange-End', (event)=>{
      setCurrentRoom( pxlNavInstance.pxlEnv.currentRoom );
    });
    
    // Clean up subscriptions
    return () => unsubscribePxlNav( componentId.current );
  }, []);
  
  // Handle button clicks by calling pxlNav methods
  const handleToggleHud = ()=>{
    const pxlNavInstance = getPxlNav();
    if( pxlNavInstance ){
      pxlNavInstance.pxlGuiDraws.guiToggleVisibility( !hudVisibility );
      setHudVisibility( !hudVisibility );
    }
  };
  
  return (
    <div className={`pxlnav-hud ${!hudVisibility ? 'hidden' : ''}`}>
      <div className="hud-top-bar">
        <div className="room-name">{currentRoom}</div>
        <button onClick={handleToggleHud}>
          {hudVisibility ? 'Hide HUD' : 'Show HUD'}
        </button>
      </div>
      {}
    </div>
  );
}
*/