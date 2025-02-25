# pxlNav Change Log :: 0.0.25 - 0.0.26
---------------------

  - `ShaderEditor.js` GLSL Shader Editor checks what object you click on to blur (de-focus) the editor bar to shink it

  - `FileIO.js` had a `console.log()` printing the found default camera location in an FBX
  
  - `effects/particles/shaders/EmberWisps.js` now has a "loop seed" that shifts the animations in the ember's every "age" loop the particle makes. So every time the particle animation resets (about 5 seconds), it gets a new seed to offset it's emission + animation position.
  
---