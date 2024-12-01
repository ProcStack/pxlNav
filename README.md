# pxlNav
Javascript + Three.js player controller for first &amp; third person navigation.

**`pxlNav` is still being isolated into a package;**
<br/>**Please see the [procstack.github.io](https://github.com/ProcStack/procstack.github.io) repo for the current `pxlNav` status &amp; working example.**


## Features -
<br/>&nbsp;\_ FPV Camera Control on PC & Mobile
<br/>&nbsp;\_ Navigation using W,A,S,D or Arrow Keys
<br/>&nbsp;\_ Load any FBX file for a Room (Scene / Level)
<br/>&nbsp;&nbsp;&nbsp;- \*FBX's are 3d scene files you can make in most CGI programs; like Maya or Blender 
<br/>&nbsp;\_ Animation Rig & Clip files are easily managed
<br/>&nbsp;\_ Shader Editor
<br/>&nbsp;&nbsp;&nbsp;- \*Hit `Y` in browser to open the shader editor with regex editing support


## Features added through your CGI program of choice -
<br/>&nbsp;\_ Instanced geometry
<br/>&nbsp;\_ Camera Position & Aim
<br/>&nbsp;\_ Auto Camera Rails
<br/>&nbsp;&nbsp;&nbsp;- \*Animated Camera Paths for Position, Look At, & Up for animation sequencing
<br/>&nbsp;\_ Item Pickups
<br/>&nbsp;\_ Jump Pads
<br/>&nbsp;\_ Point-to-Point Warp Pads ( Teleporters / Portals )
<br/>&nbsp;&nbsp;&nbsp;- \*Link a Collision Surface to a target Transform to move the user to once they step on the surface.
<br/>&nbsp;\_ Point-to-Room Warp Pads ( Move between other Rooms [ separate FBX files & runtime ] )


## Shader Edtior Keyboard Shortcuts -
<br/>&nbsp;\_ Browser default Copy, Cut, Paste, Undo, Redo, etc.
<br/>&nbsp;\_ `Ctrl + Enter`
<br/>&nbsp;&nbsp;&nbsp;- Update Shader on Material
<br/>&nbsp;&nbsp;&nbsp;  Returns use existing indent type (Spaces or Tabs)
<br/>&nbsp;\_ `Ctrl + D`
<br/>&nbsp;&nbsp;&nbsp;- Duplicate current line
<br/>&nbsp;\_ `Ctrl + K`
<br/>&nbsp;&nbsp;&nbsp;- Comment current/selected lines
<br/>&nbsp;\_ `Ctrl + Shift + K`
<br/>&nbsp;&nbsp;&nbsp;- Uncomment current/selected lines
<br/>&nbsp;\_ `Ctrl + NumPad {1,2,3}`
<br/>&nbsp;&nbsp;&nbsp;- Add selection or '.0' into float(), vec2(), vec3()
<br/>&nbsp;&nbsp;&nbsp;  `myVar` -> `vec3(myVar)`
<br/>&nbsp;&nbsp;&nbsp;  No Selection -> `vec3(.0, .0, .0)`
<br/>&nbsp;\_ `Ctrl + {Up,Down,Left,Right}`
<br/>&nbsp;&nbsp;&nbsp;- Searches for current selection in direction
<br/>&nbsp;\_ `Y`
<br/>&nbsp;&nbsp;&nbsp;- To close the Shader Editor