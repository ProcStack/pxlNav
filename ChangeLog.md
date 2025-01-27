# pxlNav Change Log :: 0.0.18 - 0.0.19
---------------------

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