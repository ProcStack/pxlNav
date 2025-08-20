// Bridge to connect pxlNav with React components
// Updated version with proper unsubscribe support and TypeScript types

// Import from the local pxlNav package
// Use require for now until module resolution is fixed
const pxlNavModule = require('pxlnav');
const { pxlNav, pxlEnums, pxlOptions, pxlUserSettings } = pxlNavModule;

// Types
interface PxlNavInstance {
  init: () => void;
  subscribe: (eventType: string, callback: Function) => void;
  unsubscribe: (eventType: string, callback: Function) => boolean;
  stop: () => void;
  active: boolean;
  [key: string]: any;
}

interface SubscriptionInfo {
  eventType: string;
  callback: Function;
}

let pxlNavInstance: PxlNavInstance | null = null;

export function initPxlNav(
  options: any, 
  projectTitle: string, 
  startingRoom: string, 
  roomBootList: string[]
): PxlNavInstance {
  // Initialize only once
  if (!pxlNavInstance) {
    pxlNavInstance = new pxlNav(options, projectTitle, startingRoom, roomBootList) as PxlNavInstance;
    pxlNavInstance.init();
  }
  return pxlNavInstance;
}

export function getPxlNav(): PxlNavInstance | null {
  return pxlNavInstance;
}

// Temp storage for subscriptions
// This is a simple map to track subscriptions by component id
const subscriptions = new Map<string, SubscriptionInfo[]>();

export function subscribePxlNav(
  componentId: string, 
  eventType: string, 
  callback: Function
): void {
  if (!pxlNavInstance) return;

  pxlNavInstance.subscribe(eventType, callback);
  
  // Track subscription for cleanup
  if (!subscriptions.has(componentId)) {
    subscriptions.set(componentId, []);
  }
  subscriptions.get(componentId)!.push({ eventType, callback });
}

// Clean up subscriptions when component unmounts
export function unsubscribePxlNav(componentId: string): void {
  if (!subscriptions.has(componentId)) return;
  
  const componentSubscriptions = subscriptions.get(componentId)!;
  let unsubscribedCount = 0;
  
  componentSubscriptions.forEach(({ eventType, callback }) => {
    if (pxlNavInstance && typeof pxlNavInstance.unsubscribe === 'function') {
      const success = pxlNavInstance.unsubscribe(eventType, callback);
      if (success) {
        unsubscribedCount++;
      } else {
        console.warn(`Failed to unsubscribe from ${eventType} - callback may not match`);
      }
    } else {
      console.warn(`Cannot unsubscribe from ${eventType} - pxlNav instance not available`);
    }
  });

  if (unsubscribedCount > 0) {
    console.log(`Successfully unsubscribed ${unsubscribedCount} event(s) for component ${componentId}`);
  }

  subscriptions.delete(componentId);
}

// Reset the entire pxlNav instance (useful for hot reload in development)
export function resetPxlNav(): void {
  if (pxlNavInstance) {
    // Clean up all subscriptions first
    unsubscribeAllPxlNav();
    
    pxlNavInstance.stop();
    pxlNavInstance = null;
    subscriptions.clear();
  }
}

// Clean up all subscriptions (useful for complete cleanup)
export function unsubscribeAllPxlNav(): void {
  const allComponentIds = Array.from(subscriptions.keys());
  allComponentIds.forEach(componentId => {
    unsubscribePxlNav(componentId);
  });
}

// Safe way to check if pxlNav is ready
export function isPxlNavReady(): boolean {
  return pxlNavInstance !== null && pxlNavInstance.active;
}
