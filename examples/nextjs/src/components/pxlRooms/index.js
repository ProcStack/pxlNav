// Auto-generated room index file
// Generated at: 2025-08-05T21:17:33.970Z

import { SaltFlatsEnvironment } from './SaltFlatsEnvironment/SaltFlatsEnvironment.js';
import { OutletEnvironment } from './OutletEnvironment/OutletEnvironment.js';

// Room exports
export {
  SaltFlatsEnvironment,
  OutletEnvironment
};

// Room metadata
export const roomInfo = {
  "SaltFlatsEnvironment" : {
    "path": "./SaltFlatsEnvironment/SaltFlatsEnvironment.js",
    "lastModified": "2025-08-05T17:11:32.970Z"
  },
  "OutletEnvironment": {
    "path": "./OutletEnvironment/OutletEnvironment.js",
    "lastModified": "2025-08-19T17:11:32.970Z"
  }
};

// Room loader function for compatibility
export async function loadRoomModule( roomName ){
  const rooms = { SaltFlatsEnvironment, OutletEnvironment };
  if( rooms[roomName] ){
    return { [roomName]: rooms[roomName] };
  }
  throw new Error( `Room ${roomName} not found` );
}

// Available room names
export const availableRooms = [ 'SaltFlatsEnvironment', 'OutletEnvironment' ];
