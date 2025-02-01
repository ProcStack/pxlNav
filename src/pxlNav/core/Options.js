

import { pxlEnums } from './Enums.js';


export const pxlOptions = {
  'verbose' : pxlEnums.VERBOSE_LEVEL.NONE,
  'fps' : {
    'PC' : 60,
    'Mobile' : 30
  },
  'subTickCalculations' : false,
  'pxlRoomRoot' : "./pxlRooms",
  'staticCamera' : false,
  'autoCamera' : false,
  'antiAliasing' : pxlEnums.ANTI_ALIASING.LOW,
  'collisionScale' : {
    'gridSize' : 50,
    'gridReference' : 1000
  },
  'shadowMapBiasing' : pxlEnums.SHADOW_MAP.BASIC,
  'LoadEnvAssetFile' : false,
  'skyHaze' : pxlEnums.SKY_HAZE.OFF,
  'loaderPhrases' : ['...loading the pixels...']
}