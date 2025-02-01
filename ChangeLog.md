# pxlNav Change Log :: 0.0.18 - 0.0.19
---------------------

 - `Options.js` has a max FPS target now, default - 
 `pxlOptions.fps = { 'PC':60, 'Mobile':30 }`
 - `Options.js` has `subTickCalculations` for running `pxlRoom.step()` calculations between frame renders; `false` by default.  If you have a strong computer, sub-tick calculations can make a room more responsive, instead of locked to frame-rate.

 - `Options.js` now has a default User Setting object, `pxlUserSettings` -
```
export const pxlUserSettings = {
  'height' : {
      'standing' : 1.75,
      'stepSize' : 5
    },
  'movement' : {
      'scalar' : 1.0,
      'max' : 10.0,
      'easing' : 0.55
    },
  'headBounce' : {
      'height' : 0.3,
      'rate' : 0.025,
      'easeIn' : 0.03,
      'easeOut' : 0.95
    },
  'jump' : {
      'impulse' : 0.75,
      'holdMax' : 2.85,
      'repeatDelay' : 0.08
    },
  'gravity' : {
      'UPS' : 0.3, // Units per Step()
      'Max' : 15.5
    },
  };
```
 - `Camera.js` can now recieve a `pxlUserSettings` structured object to set all available settings from `pxlCamera.setUserSettings( YOUT_USER_SETTINGS )`
<br/>&nbsp;&nbsp; - Simply update your `pxlOptions.userSettings` object when constructing the `pxlNav` object
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - No need to run from your `pxlRoom` object unless you want custom settings per room

---

 - `GUIBase.js` + `Environment.js` has re-enabled GUI screens
 <br/>&nbsp;&nbsp; - Initial `Help` screen for onboarding automatically loads after boot
 <br/>&nbsp;&nbsp; - `G` for Graphics Settings
 <br/>&nbsp;&nbsp; - `I` for pxlNav info

---

 - `FileIO.js` ChangeLog Correction - Incorrectly listed in prior `ChangeLog.md`
<br/>&nbsp;&nbsp; - Instance-to-Mesh Scaling is calculated from vertex attribute `color.r` with -
```
  let instanceScale = MinScale + (MaxScale - MinScale) * color.r;
```

 - `FileIO.js` now has an meshObject settings check using `checkForMeshSettings()`
 <br/>&nbsp;&nbsp; - Checks `pxlRoom.materialList[ YourObject ][ 'meshSettings' ]` for `renderOrder` setting of targeted custom material object.
 - `FileIO.js` automatically sets `GlowPass` & `GlowPassMask` objects render layers to `pxlEnum.RENDER_LAYER.GLOW` & `pxlEnum.RENDER_LAYER.GLOW_MASK` respectively.
 - `FileIO.js` + `pxlRoom.js` supports a custom sky shader now
<br/>&nbsp;&nbsp; - Just add your sky object's name to the `pxlRoom.materialList[ YOUR_OBJ_NAME ] = THREE.material` like any other custom object material in your FBX scene.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; - Automatically sets required mesh options to operate as a sky box/object
 - `FileIO.js` + `pxlRoom.js` sky shader automatically sets any found 'depthTexture' uniform with the scene's depthTexture from the renderTarget.
<br/>&nbsp;&nbsp; - This sampler can be used to read the horizon of the scene for horizon-based sky effects

 - `FileIO.js` + `Colliders.js` Axis based collision tags have been changed from {} to []
<br/>&nbsp;&nbsp; - No collider axis flags are used, as collider triangles are delegated to grid-hashes based on vertext locations automatically.

---

 - `EventManager.js` semi-added; subscription, timeout, and interval manager for `requestAnimationFrame()` based timouts and intervals
<br/>&nbsp;&nbsp; - Removes the need for class-based mitigation of subscription & event triggers called externally.
<br/>&nbsp;&nbsp;&nbsp;&nbsp; Might take another update to fully integrate,

 - `EventManager.js` is available from pxlRooms with `this.pxlEvents` with -
<br/>&nbsp;&nbsp; - `subscribe( eventClass, eventType, callback )` - Subscribe to an event type
<br/>&nbsp;&nbsp; - `unsubscribe( eventClass, eventType, callback )` - Un-Sub Event Callback
<br/>
<br/>&nbsp;&nbsp; - `subscribeOnce( eventClass, eventType, callback )` - Subscribe to an event type until the next trigger of the event type
<br/>&nbsp;&nbsp; - `unsubscribeOnce( eventClass, eventType, callback )` - Un-Sub Event Callback
<br/>
<br/>&nbsp;&nbsp; - `subscribeTimeout( eventClass, eventType, callback, timeout )` - Subscribe to an event type after a given time
<br/>&nbsp;&nbsp; - `unsubscribeTimeout(  eventClass, eventType, callback )` - Un-Sub Timeout Callback
<br/>
<br/>&nbsp;&nbsp; - `subscribeInterval( eventClass, eventType, callback, timeInterval )` - Subscribe to an event type at a given interval
<br/>&nbsp;&nbsp; - `unsubscribeInterval(  eventClass, eventType, callback )` - Un-Sub Interval Callback

---

 - `Timer.js` now has `deltaTime` & `avgDeltaTime` (Everage the last two `deltaTime` values)
 - `Timer.js` with added deltaTime, blending rates need to be exponential.  Added helper script `getLerpRate()` and `getLerpAvgRate()` to easily fit your blending rate into either `deltaTime` or `avgDeltaTime`

 - `Camera.js` converted over the static values to `deltaTime` influence for more than just jump calculations ( Jumping was the only thing using deltaTime before now ), but still some better implementation needed of `deltaTime`, it isn't perfect yet for when/where applied.
<br/>&nbsp;&nbsp; - All jumping, gravity, and movement values have been updated, please check your default movement/jump in your room.
 - `Camera.js` + `User.js` uses movement speed limits from `User.js` now, which can be set with -
<br/>&nbsp;&nbsp; - `pxlUser.setSlowSpeed( .5 )` - Slow down multiplier
<br/>&nbsp;&nbsp; - `pxlUser.setBaseSpeed( 1 )` - Base movement speed
<br/>&nbsp;&nbsp; - `pxlUser.setBoostSpeed( .5 )` - Speed up multiplier (When holding shift)

 - `FileIO.js` Since I kept accidentally exporting a "root group" for my scene export, which would break loading the FBX scene file, it now checks for a sub-folder containing all of the scene groups, then warns the user.
 <br/>&nbsp;&nbsp; _Your FBX should be TopLevelGroup -> With all group types as children (Scene, Colliders, Lights, etc.)

---
 
 - `core/Device.js` -> `device/device.js`
 - `divices/device.js` now maintains keyboards, mobile touch screens, AR/VR/XR Head-Mounted-Displays(HMD) as `XR`, & Gamepad controller class 
 - `divices/GamePad.js` added as a controller manager class.
 <br/>&nbsp;&nbsp; - Currently supporting a `Generic` class for input key mapping.
 <br/>&nbsp;&nbsp;&nbsp;&nbsp; `Playstation 4` & `Logitech F510` validated
 <br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Needed testing for - `Playstation 5`, `XBox 360`, `XBox One`, & others



---

### Expected changes --
pxlNav v0.0.19 - Mobile Support + GUI Update
<br/>&nbsp;&nbsp; _Re-enable gui elements that don't display, but are there, for onboarding, settings, help, and info

<br/>&nbsp;&nbsp; _Mobile thumbs sticks, allow for CSS override.  Circle, on tap to torus with dot that drags with visual guide to finger.
<br/>&nbsp;&nbsp; _Delegate left vs right side of screen tap, even with tap order of multi-touch.
<br/>&nbsp;&nbsp; _GUI updates to pass move and tap calls to same camera systems. This should likely go through User class. But user class doesn't fully exist yet.

<br/>&nbsp;&nbsp; _Add external settings for constant walking for drag-given-distance, vs only walk when dragged, being relativistic offset per frame.

<br/>&nbsp;&nbsp; ++ This isn't the update for User Class, but maybe I should move everything over to user class that I can.  Freeing up Third Person view to ray cast from player, rather than always from Camera

<br/>&nbsp;&nbsp; _User class would allow for better Item support for short term, which I don't believe is working after stripping out Evals(), with no replacement of Callbacks with bounded scopes.

<br/>&nbsp;&nbsp; _GUI update for mobile support can allow for inventory display and more.  Custom CSS should be accepted


---