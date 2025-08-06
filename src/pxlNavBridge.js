// Bridge to connect pxlNav with React components
// File is in progress and not fully functional yet.
//
// This file is intended to be used with React and Next.js

// 'use client'; // Next.js specific directive to enable client-side rendering

import { pxlNav } from './pxlNav.js';

let pxlNavInstance = null;

export function initPxlNav(options, projectTitle, startingRoom, roomBootList){
  // Initialize only once
  if( !pxlNavInstance ){
    pxlNavInstance = new pxlNav( options, projectTitle, startingRoom, roomBootList );
    pxlNavInstance.init();
  }
  return pxlNavInstance;
}

export function getPxlNav(){
  return pxlNavInstance;
}

// Temp storage for subscriptions
// This is a simple map to track subscriptions by component id
const subscriptions = new Map();

export function subscribePxlNav( componentId, eventType, callback ){
  if( !pxlNavInstance ) return;

  pxlNavInstance.subscribe( eventType, callback );
  
  // Track subscription for cleanup
  if( !subscriptions.has( componentId ) ){
    subscriptions.set( componentId, [] );
  }
  subscriptions.get( componentId ).push({ eventType, callback });
}

// Clean up subscriptions when component unmounts
export function unsubscribePxlNav( componentId ){
  if( !subscriptions.has( componentId ) ) return;
  
  const componentSubscriptions = subscriptions.get( componentId );
  let unsubscribedCount = 0;
  
  componentSubscriptions.forEach(( { eventType, callback } )=>{
    if( pxlNavInstance && typeof pxlNavInstance.unsubscribe === 'function' ){
      const success = pxlNavInstance.unsubscribe( eventType, callback );
      if( success ){
        unsubscribedCount++;
      }else{
        console.warn(`Failed to unsubscribe from ${eventType} - callback may not match`);
      }
    }else{
      console.warn(`Cannot unsubscribe from ${eventType} - pxlNav instance not available`);
    }
  });

  if( unsubscribedCount > 0 ){
    console.log(`Successfully unsubscribed ${unsubscribedCount} event(s) for component ${componentId}`);
  }

  subscriptions.delete( componentId );
}

// Reset the entire pxlNav instance (useful for hot reload in development)
export function resetPxlNav(){
  if( pxlNavInstance ){
    // Clean up all subscriptions first
    unsubscribeAllPxlNav();
    
    pxlNavInstance.stop();
    pxlNavInstance = null;
    subscriptions.clear();
  }
}

// Clean up all subscriptions (useful for complete cleanup)
export function unsubscribeAllPxlNav(){
  const allComponentIds = Array.from( subscriptions.keys() );
  allComponentIds.forEach( componentId => {
    unsubscribePxlNav( componentId );
  });
}

// Safe way to check if pxlNav is ready
export function isPxlNavReady(){
  return pxlNavInstance && pxlNavInstance.active;
}