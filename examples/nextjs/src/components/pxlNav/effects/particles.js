


// Particle Build Script includes

/**
 * @file particles.js
 * @description Particle Build Script includes various particle effects.
 * 
 * This module imports and exports different particle effects used in the application.
 * 
 * Documentation links for particle effects:
 * - [pxlNav.pxlEffects.pxlParticles.ParticleBase]{@link ParticleBase}
 * - [pxlNav.pxlEffects.pxlParticles.BillowSmoke]{@link BillowSmoke}
 * - [pxlNav.pxlEffects.pxlParticles.EmberWisps]{@link EmberWisps}
 * - [pxlNav.pxlEffects.pxlParticles.FloatingDust]{@link FloatingDust}
 * - [pxlNav.pxlEffects.pxlParticles.HeightMap]{@link HeightMap}
 * 
 * @module pxlNav.pxlEffects.pxlParticles
 * 
 * @todo Implement Manager classes for effects (e.g., emitter classes).
 * 
 * @requires ./particles/ParticleBase.js
 * @requires ./particles/BillowSmoke.js
 * @requires ./particles/EmberWisps.js
 * @requires ./particles/FloatingDust.js
 * @requires ./particles/HeightMap.js
 */

// TODO : Effects need Manager classes (ie. emitter classes)

import { ParticleBase } from './particles/ParticleBase.js';

import { BillowSmoke } from './particles/BillowSmoke.js';

import { EmberWisps } from './particles/EmberWisps.js';

import { FloatingDust } from './particles/FloatingDust.js';

import { HeightMap } from './particles/HeightMap.js';

/**
 * Particle effects for pxlNav.
 * @memberof pxlNav.pxlEffects
 * @property {Object} BillowSmoke - Billowing smoke particles.
 * @property {Object} EmberWisps - Ember wisps particles.
 * @property {Object} FloatingDust - Floating dust particles.
 * @property {Object} HeightMap - Height map particles. 
 */
export { ParticleBase, BillowSmoke, EmberWisps, FloatingDust, HeightMap };