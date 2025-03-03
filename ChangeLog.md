# pxlNav Change Log :: 0.0.25 - 0.0.26
---------------------


### Major Changes
  - `JSDoc` added at `./docs/jsdoc/index.html` - `https://procstack.github.io/pxlNav-docs`
    - pxlNav
    - Camera
    - HUD
    - RoomEnvironment (pxlRoom)
    - pxlEffects.pxlParticles
      - BillowSmoke
      - EmberWisps
      - FloatingDust
      - HeightMap
      - ParticleBase
  - `HUD.js` support added for different displays & button/click/tap'able regions of the screen.
  - `HUD.js` automatically builds + adds 2 joysticks for move & look controls; and jump & run tap'able regions

---

### All Changes

  - `package.json` + `JSDoc` set up through `./packing/jsdoc.config.js` built to `./docs/jsdoc`
```
npm run jsdoc
```
  - `JSDoc` + `./packing/docs-init.js` adds Class Methods List at the top of each page and adds a `^Top` link to each Method header on page

---

  - `HUD.js` added to support an array of HUD element types, found through the `HUD_ELEMENT` enum
<br/>&nbsp;&nbsp; - `Region`; A transparent clickable region
<br/>&nbsp;&nbsp; - `Button`; A clickable with `Default`, `Hover`, & `Down` styles
<br/>&nbsp;&nbsp; - All HUD elements are subscribable to; hover/click events & X,Y Drag Deltas (Thumb + DragRegion)
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Currently only `THUMBSTICK` returns touch delta `{ 'x':#, 'y':# }`
<br/>&nbsp;&nbsp; - Note - Optional `parentObj` defaults to pxlNav handled `pxlNav-hud-parent`
```
// HUD().addItem( label='default', type, data, callbackFn = null, parentObj = null ){
let newHudItem = pxlHUD.addItem( "HUD_Element_Name", pxlEnums.HUD_ELEMENT.BUTTON, { DATA } )
newHudItem.subscribe( *Your_Callback_Func* )
// -or -
pxlHUD.subscribe( "HUD_Element_Name", *Your_Callback_Func* )
```

  - `HUD.js` + `Enums.js` has `HUD_ELEMENT`, `HUD_ACTION`, & `HUD_DRAW`
<br/>&nbsp;&nbsp; - `HUD_ELEMENT` are the type of hud elements that can be created
```
export const HUD_ELEMENT = {
  'REGION' : 0,
  'DRAG_REGION' : 1,
  'BUTTON' : 2,
  'THUMBSTICK' : 3,
  'SLIDER' : 4, // Not setup yet
  'IMAGE' : 5, // Not setup yet
  'TEXT' : 6 // Not setup yet
};
```

<br/>&nbsp;&nbsp; - `HUD_ACTION` not fully implemented, but used for style settings
```
export const HUD_ACTION = {
  'NONE' : 0,
  'CLICK' : 1,
  'HOVER' : 2,
  'DRAG' : 3,
  'DROP' : 4
};
```

<br/>&nbsp;&nbsp; - `HUD_DRAW` is hud element draw style on screen
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - `BLENDED` is `blend-mode` screen; multiply onMouseOver / onTouch by default
```
export const HUD_DRAW = {
  'DEFAULT' : 0,
  'BLENDED' : 1
};

```

  - `HUD.js` now automatically builds joysticks for move & look controls; jump & run tap'able regions

---

  - `EventManager.js` has further development, not integrated, but nearly ready for implementation.
<br/>&nbsp;&nbsp; - Added checks for failed callbacks execuded through Promises


---

  - `pxlNavStyle.css` + `index.html` updated `pxlNavCoreCanvasStyle` to `pxlNav-coreCanvasStyle`
<br/>&nbsp;&nbsp; - Core style classes being renamed to `pxlNav-` for cleanliness & uniformity.

---

  - `ShaderEditor.js` GLSL Shader Editor checks what object you click on to blur (de-focus) the editor bar to shink it

  - `FileIO.js` had a `console.log()` printing the found default camera location in an FBX
  
  - `effects/particles/shaders/EmberWisps.js` now has a "loop seed" that shifts the animations in the ember's every "age" loop the particle makes. So every time the particle animation resets (about 5 seconds), it gets a new seed to offset it's emission + animation position.
  
---