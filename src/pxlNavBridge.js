// Bridge to connect pxlNav with React components
// File is in progress and not fully functional yet.
//
// This file is intended to be used with React and Next.js

// 'use client'; // Next.js specific directive to enable client-side rendering

import { pxlNav } from './pxlNav.js';

let pxlNavInstance = null;

export function initPxlNav(options, projectTitle, startingRoom, roomBootList) {
  // Initialize only once
  if (!pxlNavInstance) {
    pxlNavInstance = new pxlNav(options, projectTitle, startingRoom, roomBootList);
    pxlNavInstance.init();
  }
  return pxlNavInstance;
}

export function getPxlNav() {
  return pxlNavInstance;
}

// Temp storage for subscriptions
// This is a simple map to track subscriptions by component id
const subscriptions = new Map();

export function subscribePxlNav(componentId, eventType, callback) {
  if (!pxlNavInstance) return;
  
  pxlNavInstance.subscribe(eventType, callback);
  
  // Track subscription for cleanup
  if (!subscriptions.has(componentId)) {
    subscriptions.set(componentId, []);
  }
  subscriptions.get(componentId).push({ eventType, callback });
}

// Clean up subscriptions when component unmounts
export function unsubscribePxlNav(componentId) {
  if (!subscriptions.has(componentId)) return;
  // -- -- --
}