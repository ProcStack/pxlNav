// pxlNav Includes -
//   Primary Effect's File Conduit
//     Kevin Edzenga, 2024
// -- -- --
// Effects consist of the Effect Manager and the Effect itself.
//   For the case of Particles -
//     The particle system is the Manager and the particles themselves are Shaders


import { BillowSmoke, EmberWisps, FloatingDust, HeightMap } from './particles.js';

const pxlEffects = { 
  "pxlParticles" : { BillowSmoke, EmberWisps, FloatingDust, HeightMap },
};

export { pxlEffects };