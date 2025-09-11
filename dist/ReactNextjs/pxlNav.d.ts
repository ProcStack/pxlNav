// pxlNav types file
//   For use with TypeScript

declare module 'pxlNav' {

  export interface EventValue {
      type: string;
      value: any;
      status?: any;
  }

  export type EventCallback = (eventType: string, eventValue: EventValue) => void;

  // -- -- --

  export interface PxlUserSettings {
    height: {
      standing: number;
      stepSize: number;
    };
    movement: {
      scalar: number;
      max: number;
      easing: number;
    };
    look: {
      pc: {
        invert: boolean;
      };
      mobile: {
        invert: boolean;
      };
    };
    headBounce: {
      height: number;
      rate: number;
      easeIn: number;
      easeOut: number;
    };
    jump: {
      impulse: number;
      holdMax: number;
      repeatDelay: number;
    };
    gravity: {
      ups: number;
      max: number;
    };
    deadZone: {
      controller: number;
      touch: number;
      xr: number;
    };
  }

  // -- -- --
  
  export interface PxlOptions {
    verbose: number;
    fps: {
      pc: number;
      mobile: number;
    };
    renderScale: {
      pc: number;
      mobile: number;
    };
    staticCamera: boolean;
    autoCamera: boolean;
    allowStaticRotation: boolean;
    userSettings: pxlUserSettings | object;
    subTickCalculations: boolean;
    pxlRoomRoot: string;
    pxlAssetRoot: string;
    showOnboarding: boolean;
    onboarding: {
      pc: {
        message: string;
        messageStyle: string[];
        buttonText: string;
        buttonStyle: string[];
      };
      mobile: {
        message: string;
        messageStyle: string[];
        buttonText: string;
        buttonStyle: string[];
      };
    };
    loaderPhrases: string[];
    antiAliasing: number;
    collisionScale: {
      gridSize: number;
      gridReference: number;
    };
    shadowMapBiasing: number;
    loadEnvAssetFile: boolean;
    skyHaze: number;
    postProcessPasses: {
      roomGlowPass: boolean;
      mapComposerWarpPass: boolean;
      chromaticAberrationPass: boolean;
      lizardKingPass: boolean;
      starFieldPass: boolean;
      crystallinePass: boolean;
    };
  }

  
  export const pxlEnums: {
    'pxlEnums': object;
    'VERBOSE_LEVEL' : {
      'NONE' : number;
      'ERROR' : number;
      'WARN' : number;
      'INFO' : number;
      'DEBUG' : number;
    };
    'ANTI_ALIASING' : {
      'OFF' : number;
      'LOW' : number;
      'MEDIUM' : number;
      'HIGH' : number;
    };
    'RENDER_LAYER' : {
      'SKY': number;
      'SCENE': number;
      'PARTICLES': number;
      'GLOW': number;
      'GLOW_MASK' : number;
    };
    'SKY_HAZE' : {
      'OFF' : number;
      'VAPOR' : number;
    };
    'SHADOW_MAP' : {
      'OFF' : number;
      'BASIC' : number;
      'SOFT' : number;
    };
    'CAMERA_EVENT' : {
      'MOVE' : number;
      'ROTATE' : number;
      'JUMP' : number;
      'FALL' : number;
      'LANDED' : number;
      'COLLISION' : number;
    };
    'COLLIDER_TYPE' : {
      'FLOOR' : number;
      'WALL' : number;
      'WALL_TOP' : number;
      'CEILING' : number;
      'PORTAL_WARP' : number;
      'ROOM_WARP' : number;
      'ITEM' : number;
      'SCRIPTED' : number;
      'HOVERABLE' : number;
      'CLICKABLE' : number;
    };
    'GEOMETRY_SIDE' : {
      'FRONT' : number;
      'BACK' : number;
      'DOUBLE' : number;
    };
    'COLOR_SHIFT' : {
      'KEEP' : number;
      'sRGB_TO_LINEAR' : number;
      'LINEAR_TO_sRGB' : number;
      'WINDOWS_TO_UNIX' : number;
      'UNIX_TO_WINDOWS' : number;
      'LINEAR_TO_WINDOWS' : number;
      'WINDOWS_TO_LINEAR' : number;
      'LINEAR_TO_UNIX' : number;
      'UNIX_TO_LINEAR' : number;
    };
    'USER_SPEED' : {
      'STOP' : number;
      'SLOW' : number;
      'BASE' : number;
      'BOOST' : number;
    };
    'DEVICE_TYPE' : {
      'KEYBOARD' : number;
      'MOBILE' : number;
      'GAMEPAD' : number;
      'XR' : number;
      'VR' : number;
      'AR' : number;
      'HMD' : number;
      'OTHER' : number;
    };
    'DEVICE_EVENT' : {
      'CONNECT' : number;
      'DISCONNECT' : number;
      'BUTTON_PRESS' : number;
      'AXIS_MOVE' : number;
      'AXIS_LOOK' : number;
    };
    'DEVICE_BUTTON' : {
      'B_L' : number;
      'B_U' : number;
      'B_R' : number;
      'B_D' : number;
      'L1' : number;
      'R1' : number;
      'L2' : number;
      'R2' : number;
      'SELECT' : number;
      'START' : number;
      'L3' : number;
      'R3' : number;
      'UP' : number;
      'DOWN' : number;
      'LEFT' : number;
      'RIGHT' : number;
    };
    'DEVICE_ACTION' : {
      'MOVE' : number;
      'MOVE_X' : number;
      'MOVE_Y' : number;
      'LOOK' : number;
      'LOOK_X' : number;
      'LOOK_Y' : number;
      'JUMP' : number;
      'RUN' : number;
      'ACTION' : number;
      'ACTION_ALT' : number;
      'ITEM' : number;
      'MENU' : number;
      'PAUSE' : number;
      'MAP' : number;
    };
    'HUD_ELEMENT' : {
      'REGION' : number;
      'DRAG_REGION' : number;
      'BUTTON' : number;
      'THUMBSTICK' : number;
      'SLIDER' : number;
      'IMAGE' : number;
      'TEXT' : number;
    };
    'HUD_ACTION' : {
      'NONE' : number;
      'CLICK' : number;
      'HOVER' : number;
      'ACTIVE' : number;
      'DRAG' : number;
      'DROP' : number;
    };
    'HUD_DRAW' : {
      'DEFAULT' : number;
      'BLENDED' : number;
    };
  };

  // -- -- --

  export class pxlNav {
      constructor(options: PxlOptions, projectTitle: string, startingRoom: string, roomBootList: string[]);
      
      active: boolean;
      pxlEnums: any;
      pxlTimer: any;
      pxlShaders: any;
      pxlCamera: any;
      pxlDevice: any;

      init(): void;
      start(): void;
      stop(): void;
      bootTimer(): void;
      stopTimer(): void;
      pauseTimer(): void;
      
      addRooms(roomList: string[]): void;
      setBootRoom(bootRoom: string, bootLocation: any): void;
      setLoaderPhrases(phraseList: string[]): void;

      trigger(eventType: string, eventValue?: any, eventObj?: any): void;
      subscribe(eventType: string, callbackFunc: EventCallback): void;
      emit(eventType: string, eventValue: any, statusValue?: any): void;

      initExtension(extName: string, onFinishFn: Function, onErrorFn: Function): void;
      startExtension(extName: string, onFinishFn: Function, onErrorFn: Function): void;
      stopExtension(extName: string, onFinishFn: Function, onErrorFn: Function): void;
      extensionStatus(extName: string): any;
  }

  export const pxlNavVersion: string;

  export const pxlOptions: PxlOptions;
  export const pxlUserSettings: PxlUserSettings;

  export const pxlBase: { 
    Utils: object;
    FileIO: object;
    QualityController: object;
    CookieManager: object;
    Timer: object;
    User: object;
    Device: object;
    Colliders: object;
    Animation: object;
    Environment: object;
    GUI: object;
    HUD: object; 
    Camera: object;
    AutoCamera: object;
    Extensions: object; 
    MusicUtils: object;
    Audio: object;
    Video: object;
  };
  export const pxlShaders: {
    'animated':object,
    'core':object,
    'objects':object,
    'particles':object,
    'rendering':object,
    'scene':object
  };
  export const pxlEffects: {
    pxlParticles : { 
      BillowSmoke: object;
      EmberWisps: object;
      FloatingDust: object;
      HeightMap: object;
    };
  };

  export { pxlNav as default };
}

export {};