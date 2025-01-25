# pxlNav Docs - pxlShaders

*-Stand-In-*

The pxlCamera object currently maintains Player Controller data.  This functionality will soon move to `Users.js`, as we all know how locking the player to a camera restricts possiblities in game types.

For now, pxlCamera supports static cameras & First-Person-View cameras.  For more information on this, please see `pxlRoom` documention.

More information to come shortly.

 - `Camera.js` can be accessed from your room via `this.pxlCamera`
<br/>You can update settings for your room via these functions --

<br/>&nbsp;&nbsp; _`setJumpScalar( val )'
<br/>&nbsp;&nbsp; _`setUserHeight( val, roomName="default" )'
<br/>&nbsp;&nbsp; _`setUserScale( val )'
<br/>
<br/>&nbsp;&nbsp; _`setMovementScalar( val )'
<br/>&nbsp;&nbsp; _`setMovementEase( val )'
<br/>&nbsp;&nbsp; _`setInputMovementMult( val )'
<br/>&nbsp;&nbsp; _`setCameraRotateEasing( val )'
<br/>&nbsp;&nbsp; _`setTouchSensitivity( val )'
<br/>&nbsp;&nbsp; _`setPositionBlend( val )'
<br/>
<br/>&nbsp;&nbsp; _`setGravityRate( val )'
<br/>&nbsp;&nbsp; _`setGravityMax( val )'
<br/>
<br/>&nbsp;&nbsp; _`setWalkBounceHeight( val )'
<br/>&nbsp;&nbsp; _`setWalkBounceRate( val )'
<br/>&nbsp;&nbsp; _`setWalkBounceEaseIn( val )'
<br/>&nbsp;&nbsp; _`setWalkBounceEaseOut( val )'
<br/>
<br/>&nbsp;&nbsp; _`setFOV( fov )'
<br/>&nbsp;&nbsp; _`setStats( fov, aspect, near, far )'
<br/>&nbsp;&nbsp; _`setAspect( aspect )' - *Aspect needs updates, use FOV for now*
<br/>&nbsp;&nbsp; _`setTransform( pos, lookAt=null )'