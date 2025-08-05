// File is in progress and not fully functional yet.
// This file is intended to be used with React and Next.js

// 'use client'; // For Next.js

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initPxlNav, getPxlNav, resetPxlNav } from './pxlNavBridge';
import { pxlOptions, pxlUserSettings } from './pxlNav';
import PxlNavHUD from './pxlNav/jsx/gui';
import { PxlNavErrorBoundary } from './components/PxlNavErrorBoundary';

export default function PxlNavContainer({ 
  projectTitle = "pxlNav",
  options = {},
  startingRoom = "DefaultRoom",
  roomBootList = ["DefaultRoom"],
  onBooted,
  onError
}){
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pxlNavInstance, setPxlNavInstance] = useState(null);
  const [error, setError] = useState(null);

  const handleError = useCallback((err) => {
    console.error('PxlNav initialization error:', err);
    setError(err);
    if (onError) onError(err);
  }, [onError]);

  useEffect( ()=>{
    let mounted = true;
    
    const initializeNav = async ()=>{
      try{
        // Ensure we're in browser environment
        if( typeof window === 'undefined' ) return;
        
        // Create div for pxlNav to target - append to our container instead of body
        const coreDiv = document.createElement( 'div' );
        coreDiv.id = 'pxlNav-coreCanvas';
        
        // Append to our container ref instead of document.body for better React integration
        if( containerRef.current ){
          containerRef.current.appendChild( coreDiv );
        }else{
          // Fallback to body if ref isn't ready
          document.body.appendChild( coreDiv );
        }
        
        // Configure and initialize pxlNav
        const mergedOptions = {...pxlOptions, ...options};
        mergedOptions.userSettings = {...pxlUserSettings, ...(options.userSettings || {})};
        
        const instance = initPxlNav(
          mergedOptions, 
          projectTitle,
          startingRoom,
          roomBootList
        );
        
        if( !mounted ) return;
        
        setPxlNavInstance( instance );
        
        // Let React know initialization is complete
        instance.subscribe( 'booted', () => {
          if( mounted ) {
            setIsInitialized(true);
            if( onBooted ){
              onBooted();
            }
          }
        });
        
      }catch(err) {
        if( mounted ) {
          handleError(err);
        }
      }
    };

    initializeNav();
    
    // Cleanup
    return ()=>{
      mounted = false;
      
      // Clean up the DOM element
      const existingDiv = document.getElementById( 'pxlNav-coreCanvas' );
      if (existingDiv && existingDiv.parentNode) {
        existingDiv.parentNode.removeChild(existingDiv);
      }
      
      // Stop pxlNav if possible
      if( pxlNavInstance && typeof pxlNavInstance.stop === 'function' ){
        pxlNavInstance.stop();
      }
      
      // Reset for development hot reload
      if( process.env.NODE_ENV === 'development' ){
        resetPxlNav();
      }
    };
  }, [projectTitle, options, startingRoom, roomBootList, onBooted, handleError, pxlNavInstance] );

  if( error ){
    return (
      <div style={{ padding: '20px', border: '1px solid red', borderRadius: '4px' }}>
        <h3>Failed to initialize pxlNav</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }
  
  return (
    <PxlNavErrorBoundary>
      <div className="pxlnav-react-container" ref={containerRef}>
        {/* Canvas is managed by Three.js directly */}
        <div id="pxlNav-coreCanvas-container" />
        
        {/* React-based UI components */}
        {isInitialized && <PxlNavHUD />}
        
        {/* Loading indicator */}
        {!isInitialized && !error && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px'
          }}>
            Loading pxlNav...
          </div>
        )}
      </div>
    </PxlNavErrorBoundary>
  );
}