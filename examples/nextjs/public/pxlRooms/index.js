import { OutletEnvironment } from './OutletEnvironment/OutletEnvironment.js';

// Room exports
export {
  OutletEnvironment
};

// Room metadata
export const roomInfo = {
  "OutletEnvironment" : {
    "path": "./OutletEnvironment/OutletEnvironment.js",
    "lastModified": "2025-08-20T11:48:22.802Z"
  }
};

// Room loader function for compatibility
export async function loadRoomModule( roomName ){
  const rooms = { OutletEnvironment };
  if( rooms[roomName] ){
    return { [roomName]: rooms[roomName] };
  }
  throw new Error( `Room ${roomName} not found` );
}

// Available room names
export const availableRooms = [ 'OutletEnvironment' ];
