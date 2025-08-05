// Type definitions for pxlNav React integration
// This file helps with development even though the main pxlNav is JavaScript

export interface PxlNavOptions {
  verbose?: number;
  fps?: {
    pc: number;
    mobile: number;
  };
  userSettings?: PxlUserSettings;
  pxlRoomRoot?: string;
  staticCamera?: boolean;
  loadEnvAssetFile?: boolean;
  collisionScale?: {
    gridSize: number;
    gridReference: number;
  };
  [key: string]: any;
}

export interface PxlUserSettings {
  height?: {
    standing: number;
    stepSize: number;
  };
  [key: string]: any;
}

export interface PxlNavInstance {
  active: boolean;
  subscribe: (eventType: string, callback: Function) => void;
  trigger: (eventType: string, eventValue?: any, eventObj?: any) => void;
  emit: (eventType: string, eventValue: any, statusValue?: any) => void;
  start: () => void;
  stop: () => void;
  init: () => void;
  [key: string]: any;
}

export interface PxlNavContainerProps {
  projectTitle?: string;
  options?: Partial<PxlNavOptions>;
  startingRoom?: string;
  roomBootList?: string[];
  onBooted?: () => void;
  onError?: (error: Error) => void;
}

export type PxlNavEventType = 
  | 'booted'
  | 'step'
  | 'render-prep'
  | 'shaderEditorVis'
  | 'roomChange-Start'
  | 'roomChange-Middle'
  | 'roomChange-End'
  | 'fromRoom'
  | 'device-keydown'
  | 'device-keyup'
  | 'device-resize'
  | 'camera-move'
  | 'camera-rotate'
  | 'camera-jump'
  | 'camera-fall'
  | 'camera-landed'
  | 'camera-collision'
  | 'pingPong';

export type PxlNavTriggerType =
  | 'camera'
  | 'warptoroom'
  | 'roommessage'
  | 'ping';
