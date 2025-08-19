"use client";
import React from 'react';
import App from '../App';

// Simple client wrapper to mount the existing SPA-style App inside Next's app router
export default function PxlNavClient() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <App />
    </div>
  );
}
