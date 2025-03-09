// Module entry point for pxlNav
//   Import all necessary modules and components
//   Re-export everything for easy access

// Import all pxlNav exports
import { 
  pxlNavVersion, 
  pxlNav, 
  pxlEnums, 
  pxlUserSettings,
  pxlOptions,
  RoomEnvironment,
  pxlEffects,
  pxlShaders,
  pxlBase
} from './dist/pxlNav.esm.js';

// Export all components
export { 
  pxlNavVersion, 
  pxlEnums, 
  pxlUserSettings,
  pxlOptions,
  RoomEnvironment,
  pxlEffects,
  pxlShaders,
  pxlBase
};

// Export pxlNav as both named & default
export { pxlNav };
export default pxlNav;