// pxlNav types file
//   For use with TypeScript

declare module 'pxlnav' {

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
    subFrameCalculations: boolean;
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
      glowPass: boolean;
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

  export class RoomEnvironment {
    constructor( roomName:string, assetPath:string );
    
    // Core identity
    roomName: string;

    // pxlNav dependencies (set via setDependencies)
    pxlOptions: any;
    pxlEnums: any;
    pxlFile: any;
    pxlUtils: any;
    pxlTimer: any;
    pxlAnim: any;
    pxlColliders: any;
    pxlDevice: any;
    pxlHUD: any;
    pxlRendering: any;
    pxlEnv: any;

    // lifecycle / flags
    booted: boolean;
    initScene: boolean;
    active: boolean;
    mobile: boolean;

    // assets & scene data
    assetPath: string;
    sceneFile: any | null;
    animFile: any | null;
    animClips: Record<string, any>;
    animMixer: any | null;

    // materials / shaders / particles
    spiralizerUniforms: any;
    materialList: Record<string, any>;
    revertColorSpaceList: any[];
    particleList: Record<string, any>;

    // camera / warp data
    camInitPos: any | null;
    camInitLookAt: any | null;
    camThumbPos: any;
    camThumbLookAt: any;
    cameraBooted: boolean;
    cameraPrevPos: any;
    cameraAimTarget: any;
    camHoldWarpPos: boolean;
    defaultCamLocation: string;
    camLocation: Record<string, any>;

    pxlCamFOV: { PC: number; MOBILE: number };
    pxlCamZoom: number;
    pxlCamAspect: number;
    pxlCamNearClipping: number;
    pxlCamFarClipping: number;

    fogColor: any;
    fogExp: number;
    fog: any;

    // scene groups / materials
    userAvatarGroup: any;
    packedTextureMaterial: any;
    coreTextureMaterial: any;
    projectedMaterial: any;
    voidMaterial: any;
    holoMaterial: any;
    aspectRatio: any;
    flag: any;

    initPos: any[];
    finalPos: any[];
    midPos: any;

    perspectiveInstances: number;

    // timing
    startTime: number;
    runTime: any;
    msRunner: any;

    // runtime scene objects
    camera: any;
    autoCamPaths: Record<string, any>;
    scene: any;
    lightList: Record<string, any>;
    geoList: Record<string, any>;
    glassGroup: any;
    glassList: any[];
    lodList: any[];

    // raycasting / interactivity
    enableRaycast: boolean;
    hasHoverables: boolean;
    hoverableList: any[];
    hoverableObj: any | null;
    hasClickables: boolean;
    clickableList: any[];
    clickableObj: any | null;

    // colliders
    collidersExist: boolean;
    colliderActive: boolean;
    colliderHashMap: Record<string, any>;
    colliderList: any[];
    antiColliderActive: boolean;
    antiColliderList: any[];
    antiColliderTopActive: boolean;
    antiColliderTopList: any[];

    hasPortalExit: boolean;
    portalList: Record<string, any>;

    hasRoomWarp: boolean;
    roomWarp: any[];
    warpPortalTexture: any;
    warpZoneRenderTarget: any;

    worldPosMaterial: any;
    worldPosRenderTarget: any;
    spiralizerPass: any;
    bloomPreState: boolean;

    cloud3dTexture: any;
    smoothNoiseTexture: any;

    // helpers
    hasHelpers: boolean;
    helperObjects: Record<string, any>;

    // shader editing state
    currentShader: string | null;

    // runtime mouse hits
    mouseRayHits?: any[];

    // getters
    readonly deltaTime?: number;
    readonly avgDeltaTime?: number;

    // lerp helpers
    getLerpRate?(rate: number): number;
    getLerpAvgRate?(rate: number): number;

    // methods
    setDependencies(pxlNav: any): void;
    init(): void;
    start(): void;
    step(): void;
    stop(): void;
    resize(sW: number, sH: number): void;
    setUserHeight(toHeight?: number): void;
    resetCamera(): void;

    prepPortalRender(): void;
    cleanupPortalRender(): void;
    setPortalTexture(texture: any, toRoom?: string | null): void;
    applyRoomPass?(roomComposer?: any): any | null;

    getName(): string;
    getArtistInfo(): any | null;
    setFog(color: any): void;

    getShaderList(): Record<string, string>;
    getCurrentShader(): string;
    readShader(objShader?: string, sliderVectorObj?: any): any;
    setShader(unis: any, vert: string, frag: string): void;

    castRay(isClick: boolean, mButton: number): void;

    hitColliders(colliderList?: any[], colliderType?: number): void;
    hasColliders(): boolean;
    hasColliderType(colliderType?: number): boolean;
    getColliders(colliderType?: number): any[];

    addColliderHelper(colliderType?: number): void;
    stepColliderHelper(colliderType?: number): void;

    toCameraPos(positionName?: string | null): void;

    fbxPostLoad(): void;
    animPostLoad(animKey: string, animMixers: any): void;

    build(): void;

    onMessage(msgType: string, msgValue: any): void;
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

  // Named export `pxlNav` (class) is declared above.

  // Runtime default export is an object containing several named exports.
  // Provide a typed shape for the default import (pxlNavDefault).
  export interface PxlNavDefaultObject {
    pxlNav: typeof pxlNav;
    pxlNavVersion: string;
    pxlEnums: typeof pxlEnums;
    pxlUserSettings: typeof pxlUserSettings;
    pxlOptions: typeof pxlOptions;
    RoomEnvironment: typeof RoomEnvironment;
    pxlEffects: typeof pxlEffects;
    pxlShaders: typeof pxlShaders;
    pxlBase: typeof pxlBase;
  }

  // Also allow default import to be the object shape and provide a runtime value
  declare const pxlNavDefault: PxlNavDefaultObject;
  export default pxlNavDefault;
}

export {};
