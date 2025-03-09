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

  export interface pxlUserSettings {
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
  
  export interface pxlOptions {
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
    userSettings: pxlUserSettings;
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
    LoadEnvAssetFile: boolean;
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
    'VERBOSE_LEVEL' : enum;
    'ANTI_ALIASING' : enum;
    'RENDER_LAYER' : enum;
    'SKY_HAZE' : enum;
    'SHADOW_MAP' : enum;
    'CAMERA_EVENT' : enum;
    'COLLIDER_TYPE' : enum;
    'GEOMETRY_SIDE' : enum;
    'COLOR_SHIFT' : enum;
    'USER_SPEED' : enum;
    'DEVICE_TYPE' : enum;
    'DEVICE_EVENT' : enum;
    'DEVICE_BUTTON' : enum;
    'DEVICE_ACTION' : enum;
    'HUD_ELEMENT' : enum;
    'HUD_ACTION' : enum;
    'HUD_DRAW' : enum;
  };

  // -- -- --

  export class pxlNav {
      constructor(options: pxlOptions, projectTitle: string, startingRoom: string, roomBootList: string[]);
      
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