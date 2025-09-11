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
} from './builds/pxlNav.esm.js';

// Export all components
export { 
  pxlNavVersion, 
  pxlNav,
  pxlEnums, 
  pxlUserSettings,
  pxlOptions,
  RoomEnvironment,
  pxlEffects,
  pxlShaders,
  pxlBase
};

// Export pxlNav as both named & default
export default pxlNav;