

// pxlNav Includes -
//   Primary Effect's File Conduit
//     Kevin Edzenga, 2024
// -- -- --
// Effects consist of the Effect Manager and the Effect itself.
//   For the case of Particles -
//     The particle system is the Manager and the particles themselves are Shaders

/**
 * @file effects.js
 * @description Primary Effect's File Conduit for pxlNav. This module includes the Effect Manager and the Effect itself.
 * 
 * Documentation links for particle effects:
 * - [pxlNav.pxlEffects.pxlParticles]{@link pxlNav.pxlEffects.pxlParticles}
 * 
 * @module pxlNav.pxlEffects
 * 
 * @requires ./particles.js
 */

import { ParticleBase, BillowSmoke, EmberWisps, FloatingDust, HeightMap } from './particles.js';

const pxlEffects = { 
  "pxlParticles" : { ParticleBase, BillowSmoke, EmberWisps, FloatingDust, HeightMap },
};

/**
 * pxlEffects for pxlNav.
 * @memberof pxlNav
 * @property {Object} pxlParticles - Particle effects.
 */
export { pxlEffects };