// pxlNav Collision Manager
// -- -- -- -- -- -- -- -- --
// Written by Kevin Edzenga; 2025
//
// Parse colliders from the FBX scene, prep collision objects, pre-calculate barycentric data, and perform collision detections.
//
// I looked to Three.js for ray-intercept integration, which cited -
//   Real-Time Collision Detection, Chapter 5 - 5.1.5; by Christer Ericson;
//     Published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.
//     Page 136; 5.1.5 -
//       https://www.r-5.org/files/books/computers/algo-list/realtime-3d/Christer_Ericson-Real-Time_Collision_Detection-EN.pdf
//   Along with barycentric coordinates for triangle collision detection cited in Three.js from -
//     http://www.blackpawn.com/texts/pointinpoly/default.html
//   ( This source also cites `Real-Time Collision Detection` by Christer Ericson )
//
//   This was source from Three.js `closestPointToPoint()`,
//     Linked to `getInterpolation()` & `getBarycoord()`; from `three.core.js:8504` v172
//       https://github.com/mrdoob/three.js/blob/dev/build/three.core.js
//     ( Since the source is split up, I'm just linking to the main file )
//
//  Couldn't get the above working 100%, so made `castRay()` for Vector Ray to Triangle collision
//    It works with floor and interactable colliders, but slightly heavier than the other method
//  Looked to this PDF for Moller-Trumbore Ray-Intersect, pages 4 & 5
//    https://cadxfem.org/inf/Fast%20MinimumStorage%20RayTriangle%20Intersection.pdf
//
// I implemented a per-pxlRoom hash grid for ground collision detection, 
//   As ray casting to all polygons in a scene is inefficient
// While also using the logic outlined in the book as used in Three.js, I've adapted it to my needs --
//  `Colliders.prepColliders()` and `Colliders.prepInteractables()`
//     Are used to build the hash grid and face-vertex associations for collision detection.
//  `Colliders.castGravityRay()` and `Colliders.castInteractRay()`
//     Are the primary functions for collision detection.

import {
  Vector2,
  Vector3,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  Mesh,
  DoubleSide,
  AdditiveBlending
} from "../../libs/three/three.module.min.js";

import { VERBOSE_LEVEL, COLLIDER_TYPE, GEOMETRY_SIDE } from "./Enums.js";

// Some assumptions are made here, as collision meshes are ussually low poly
//   A grid size of 100 is assumed for -+500 unit bounds
//     This is 10x larger than the assumed grid size in my CGI program.
//       As my collision triangles range from 20-200 Meter units in size
//
// Many productions assume 1 Unit as 1 Meter; 500 units is 500 meters
//   But that isn't good when precision is an issue for "other" reasons
//     Blend shapes or other deformations can be problematic with precision issues
//   If you are using Centimeters or Inches, you may need to adjust the grid size 10x or 40x smaller
//
// Please pass in the appropriate grid size & reference bounds for your scene
//   If unsure, you're grid in your cgi program of choice is a good reference
//     Most CGI program grids are -10 to +10, split into 5 units, in X,Z
//       Or marked every 10 units
//     If using Blender, you have an infinite X,Y grid, with FAINTLY thicker lines every 5 units
//       Place a 10x10 grid on the floor and use that as a reference
//
// Reference Bounds?
//   This is used to adjust the grid size based on the collider bounds
//     As productions ussually employ a set unit scale, 
//       Scene bounds may be an after-thought
//   By defualt, I'm using 10x the grid size as a reference.
//   If the grid size is smaller than expected based on the bounding box,
//     The gridSize will be adjusted to your scene automatically
//       It will be REDUCED to match the grid-bounds ratio of the collider
//         So setting your grid sizing higher is better than lower
//
// Still not sure?
//   Leave the defaults and run pxlNav in -
//    `pxlOptions.verbose = pxlEnums.VERBOSE_LEVEL.INFO` verbose mode
//       Then look at the console output for the found bounds and grid size adjustments
//
// Defaults -
//   Grid Sizing of 100 units
//   Reference Bounds of 500 units
//
export class Colliders{
  constructor( verbose=false, hashGridSizing = 100, colliderBoundsReference = 500.0 ){
    this.pxlEnv = null;
    this.pxlUtils = null;
    this.verbose = verbose;

    this.delimiter = ',';

    this.roomColliderData = {};

    this.baseGridSize = hashGridSizing;

    this.degToRad = Math.PI / 180;
    this.epsilon = 0.00001;

    // Assume a base grid size of 100 to assume for -+500 unit bounds
    //   This will generate potentially 10x10 grid locations
    //     This should be enough to mitigate higher poly count colliders
    this.colliderBoundsReference = colliderBoundsReference;

    // Debugging --
    this.prevGridKey = "";

  }
  setDependencies( pxlEnv ){
    this.pxlEnv = pxlEnv;
    this.pxlUtils = pxlEnv.pxlUtils;
  }
  log( msg ){
    if( this.verbose >= VERBOSE_LEVEL.INFO ){
      console.log( msg );
    }
  }
  warn( msg ){
    if( this.verbose >= VERBOSE_LEVEL.WARN ){
      console.warn( msg );
    }
  }
  error( msg ){
    if( this.verbose >= VERBOSE_LEVEL.ERROR ){
      console.error( msg );
    }
  }

  // For now, all classes should have a init(), start(), stop() step()
  init(){}
  start(){}
  stop(){}
  step(){}

  // -- -- --

  // Boot room colliders and find hash map for collision detection
  prepColliders( pxlRoomObj, colliderType=COLLIDER_TYPE.FLOOR, gridSize = null ){
    if( pxlRoomObj.hasColliders() ){

      if( !gridSize ){
        gridSize = this.baseGridSize;
      }

      let gridSizeInv = 1 / gridSize;

      // If the user runs `prepColliders` on Hover or Clickable objects,
      //   It's assumed the user meant to run `prepInteractables`
      // `prepColliders` is ran internally, but can be called externally
      if( colliderType == COLLIDER_TYPE.HOVERABLE || colliderType == COLLIDER_TYPE.CLICKABLE ){
        this.prepInteractables( pxlRoomObj, colliderType );
        return;
      }

      let roomName = pxlRoomObj.getName();
      let collidersForHashing = pxlRoomObj.getColliders( colliderType );
      // 
      if( !this.roomColliderData.hasOwnProperty( roomName ) ){
        this.roomColliderData[ roomName ] = {};
      }
      if( !this.roomColliderData[ roomName ].hasOwnProperty( colliderType ) ){
        this.roomColliderData[ roomName ][ colliderType ] = {};
        this.roomColliderData[ roomName ][ colliderType ][ 'helper' ] = null;
        this.roomColliderData[ roomName ][ colliderType ][ 'count' ] = 0;
        this.roomColliderData[ roomName ][ colliderType ][ 'gridSize' ] = gridSize;
        this.roomColliderData[ roomName ][ colliderType ][ 'gridSizeInv' ] = gridSizeInv;
        this.roomColliderData[ roomName ][ colliderType ][ 'faceVerts' ] = {};
        this.roomColliderData[ roomName ][ colliderType ][ 'faceGridGroup' ] = {};
      }

      // Agregate vertex locations and find min/max for collider bounds
      let vertexLocations = [];
      // Collider minimum and maximum bounding box data
      //   Infinity scares me...
      let colliderMinMax = { 
          "min" : new Vector2( Infinity, Infinity ), 
          "max" : new Vector2( -Infinity, -Infinity )
        };

      // Find grid size, gather vertex locationns for grid positioning, and store the collidering faces in the grid
      //   Utilizing barcentric coordinates to determine if a grid location is within a face triangle
      collidersForHashing.forEach( (collider)=>{
        let colliderVertices = collider.geometry.attributes.position.array;
        let colliderVertexCount = colliderVertices.length / 3;
        for( let x = 0; x < colliderVertexCount; ++x ){
          let vert = new Vector2( colliderVertices[ x * 3 ], colliderVertices[ (x * 3) + 2 ] );
          vertexLocations.push( vert );
          colliderMinMax.min.min( vert );
          colliderMinMax.max.max( vert );
        }
      });


      // Adjust gridSize based on min/max bounds
      //   If default gridSize is too large, reduce it to help performance
      let colliderSize = colliderMinMax.max.clone().sub( colliderMinMax.min );
      let maxColliderSize = Math.abs( Math.max( colliderSize.x, colliderSize.z ) );
      let gridSizeScalar = Math.min( 1.0, maxColliderSize / this.colliderBoundsReference );
      if( gridSizeScalar < 1.0 ){
        let origGridSize = gridSize;
        gridSize = gridSize * gridSizeScalar;
        gridSizeInv = 1 / gridSize;
        this.roomColliderData[ roomName ][ colliderType ][ 'gridSize' ] = gridSize;
        this.roomColliderData[ roomName ][ colliderType ][ 'gridSizeInv' ] = gridSizeInv;

        // Verbose feedback to aid in adjusting grid size for users
        this.log( "Grid size adjusted for pxlRoom: " + roomName + "; from " + origGridSize + " to " + gridSize + " units; " + gridSizeScalar + "%" );
        this.log( "Reference bound set to: " + this.colliderBoundsReference + " units" );
        this.log( "Total pxlRoom bounds found: " + maxColliderSize + " units" );
      }else{
        // Verbose feedback to aid in adjusting grid size for users
        this.log( "-- Grid size unchanged for pxlRoom '" + roomName + "', collider bounds within reference bounds --" );
      }
      this.log( "Collider bounds: {x:" + colliderMinMax.min.x + ", y:" + colliderMinMax.min.y + "} -to- {x:" + colliderMinMax.max.x + ", y:" + colliderMinMax.max.y +" }" );

      // Generate the grid map for collision detection per faces within grid locations
      //   Store the face vertices, edges, and barycentric coordinates for collision detection performance
      let colliderBaseName = -1;
      let colliderTriCount = 0;
      collidersForHashing.forEach( (collider)=>{
        colliderBaseName++;
        let colliderFaceVerts = collider.geometry.attributes.position.array;
        let colliderFaceCount = colliderFaceVerts.length / 3;

        let colliderMatrix = collider.matrixWorld;

        //Gather occupied grid locations
        for( let x = 0; x < colliderFaceCount; ++x ){
          // Get face-vertex positions
          //   [ [...], x1,y1,z1, x2,y2,z2, x3,y3,z3, [...] ] -> Vector3( x1, y1, z1 )
          let baseIndex = x * 9;
          let v0 = new Vector3( colliderFaceVerts[ baseIndex ], colliderFaceVerts[ baseIndex + 1 ], colliderFaceVerts[ baseIndex + 2 ] );
          let v1 = new Vector3( colliderFaceVerts[ baseIndex + 3 ], colliderFaceVerts[ baseIndex + 4 ], colliderFaceVerts[ baseIndex + 5 ] );
          let v2 = new Vector3( colliderFaceVerts[ baseIndex + 6 ], colliderFaceVerts[ baseIndex + 7 ], colliderFaceVerts[ baseIndex + 8 ] );

          // Apply matrix world to face vertices
          v0.applyMatrix4( colliderMatrix );
          v1.applyMatrix4( colliderMatrix );
          v2.applyMatrix4( colliderMatrix );

          // Perhaps degenerative or empty face
          //   I was seeing it in some instances, so I'm checking for it
          if( v0.length() == 0 && v1.length() == 0 && v2.length() == 0 ){
            continue;
          }

          // Find bounding box for the triangle
          let minX = Math.min(v0.x, v1.x, v2.x);
          let maxX = Math.max(v0.x, v1.x, v2.x);
          let minZ = Math.min(v0.z, v1.z, v2.z);
          let maxZ = Math.max(v0.z, v1.z, v2.z);

          // Find the grid spances of the bounding box
          let minGridX = Math.floor(minX * gridSizeInv);
          let maxGridX = Math.floor(maxX * gridSizeInv);
          let minGridZ = Math.floor(minZ * gridSizeInv);
          let maxGridZ = Math.floor(maxZ * gridSizeInv);

          // -- -- --

          colliderTriCount++;

          // -- -- --

          // Gather the core math required for every ray cast
          //   The below is stored to reduce runtime calculation latency

          // Edge vectors
          let edge0 = v1.clone().sub(v0);
          let edge1 = v2.clone().sub(v0);

          // Face normal
          let faceNormal = edge0.clone().cross(edge1);//.normalize();

          // Vertex-Edge relationships
          let dotE0E0 = edge0.dot(edge0);
          let dotE0E1 = edge0.dot(edge1);
          let dotE1E1 = edge1.dot(edge1);

          // Calculate tiangle area ratio
          let areaInv = 1 / (dotE0E0 * dotE1E1 - dotE0E1 * dotE0E1);


          // Face-Vertex data for grid location association
          let curColliderName = collider.name != "" ? collider.name : "collider_" + colliderBaseName;
          let faceKey = this.getGridKey(curColliderName,"_face_", this.flattenVector3( v0 ), this.flattenVector3( v1 ), this.flattenVector3( v2 ) );
          let faceVerts = {
              "object" : collider,
              "name" : collider.name,
              "key" : faceKey,
              "verts" : [ v0, v1, v2 ],
              "edge0" : edge0,
              "edge1" : edge1,
              "normal" : faceNormal,
              "dotE0E0" : dotE0E0,
              "dotE0E1" : dotE0E1,
              "dotE1E1" : dotE1E1,
              "areaInv" : areaInv
            };
          this.roomColliderData[roomName][ colliderType ]['faceVerts'][faceKey] = faceVerts;

          // -- -- --

          // Triangle is self contained within 1 grid location
          if( minGridX == maxGridX && minGridZ == maxGridZ ){
            this.addFaceToGridLocation( roomName, colliderType, minGridX, minGridZ, faceKey );
            continue;
          }

          // -- -- --

          // Third edge segment is used for edge-grid intersection detection
          let edge3 = v2.clone().sub(v1);

          // -- -- --

          // Should no triangles be self contained within a grid location,
          //   Check if any triangle edges clip the grid location,
          //     If not, check if each grid center is within the triangle using barycentric coordinates

          for (let gx = minGridX; gx <= maxGridX; ++gx) {
            for (let gz = minGridZ; gz <= maxGridZ; ++gz) {
              // Add face to grid location
              //   I was running into some issues with the grid key generation, so log all grid locations
              //     This does add some overhead to castRay(), but it's still WAY less than checking all triangles in a mesh
              this.addFaceToGridLocation( roomName, colliderType, gx, gz, faceKey );
              continue;


              let gridXMin = gx * gridSize;
              let gridXMax = (gx + 1) * gridSize;
              let gridZMin = gz * gridSize;
              let gridZMax = (gz + 1) * gridSize;
              // Check if any triangle edges intersect the grid location
              let checkEdgeIntersections = 
                  this.isGridEdgeIntersecting( v0, edge0, gridXMin, gridXMax, gridZMin, gridZMax ) ||
                  this.isGridEdgeIntersecting( v0, edge1, gridXMin, gridXMax, gridZMin, gridZMax ) ||
                  this.isGridEdgeIntersecting( v1, edge3, gridXMin, gridXMax, gridZMin, gridZMax ) ;


              if( checkEdgeIntersections ){
                this.addFaceToGridLocation( roomName, colliderType, minGridX, minGridZ, faceKey );
                continue;
              }

              // -- -- --

              // Triangle is larger than the grid location and no edges intersect grid edges
              //   Fallback to grid center barcentric check

              let gridCenter = new Vector3((gx + 0.5) * gridSize, 0, (gz + 0.5) * gridSize);
              
              // Origin-Edge relationships
              let origEdge = gridCenter.clone().sub(v0);

              // Vertex-Edge relationships
              let dotE0EOrig = edge0.dot(origEdge);
              let dotE1EOrig = edge1.dot(origEdge);

              // Calculate barycentric coordinates
              let u = (dotE1E1 * dotE0EOrig - dotE0E1 * dotE1EOrig) * areaInv;
              let v = (dotE0E0 * dotE1EOrig - dotE0E1 * dotE0EOrig) * areaInv;

              // Grid center collided with given triangle
              if (u >= 0 && v >= 0 && (u + v) < 1) {
                this.addFaceToGridLocation( roomName, colliderType, gx, gz, faceKey );
              }
            }
          }
        }
      });

      // Remove any duplicate face entries from `faceGridGroup`
      //   This should be rare, but since I'm not reading Y values for key naming, it's possible
      //     Make a building with a bunch of the same layout per floor, with the same collision object, you'll get duplicate face vertices
      //       Better safe than sorry, it should be a fast run, but it is javascript after all
      let faceGridGroupKeys = Object.keys( this.roomColliderData[ roomName ][ colliderType ][ 'faceGridGroup' ] );
      for( let x = 0; x < faceGridGroupKeys.length; ++x ){
        let curEntry = this.roomColliderData[ roomName ][ colliderType ][ 'faceGridGroup' ][ faceGridGroupKeys[x] ];
        this.roomColliderData[ roomName ][ colliderType ][ 'faceGridGroup' ][ faceGridGroupKeys[x] ] = [ ...new Set( curEntry ) ]; // Python has ruined me, `list( set( (...) ) )`
      }


      this.roomColliderData[ roomName ][ colliderType ][ 'count' ] = colliderTriCount;
      this.log( " -- Collider Count for " + roomName + " : " + colliderTriCount );


      // Full dump of collider data for the room
      //   This is for debugging purposes
      //this.log( this.roomColliderData[roomName][ colliderType ]['faceGridGroup'] );
    }else{
      this.log( " -- No colliders found for room: " + pxlRoomObj.getName() );
      this.log( "      If you didn't intend on including collider objects in your FBX, something went wrong. Please check your FBX for unintentional collider user-detail attributes on mainScene objects." );
    }
  }
  
  // -- -- --

  // Parse vert locations, calculate barcentric coordinates, and build roomColliderData dictionary
  //   No need for grid sampling, as the likely-hood of an interactable being in the same/neighboring grid location is low
  prepInteractables( pxlRoomObj, colliderType=COLLIDER_TYPE.HOVERABLE ){

    if( !pxlRoomObj.hasColliderType( colliderType ) ) return;

    let roomName = pxlRoomObj.getName();
    let curInteractables = pxlRoomObj.getColliders( colliderType );
    //console.log( curInteractables );

    if( curInteractables.length == 0 ) return; // No interactables found, user may have removed objects from the scene during runtime

    // Build interactable collider base data
    if( !this.roomColliderData.hasOwnProperty( roomName ) ){
      this.roomColliderData[ roomName ] = {};
    }

    // -- -- --

    let colliderBaseName = -1;
    curInteractables.forEach( (collider)=>{
      colliderBaseName++;
      let colliderFaceVerts = collider.geometry.attributes.position.array;
      let colliderFaceCount = colliderFaceVerts.length / 3;

      let curInteractableName = collider.name ;// != "" ? collider.name : "Interactable_" + colliderBaseName;

      // Logic change from `prepColliders`, as interactables may be hover AND clickable
      //   By-pass the colliderType specification
      // If the interactable is already in the roomColliderData, skip it
      if( this.roomColliderData[ roomName ].hasOwnProperty( curInteractableName ) ){
        return; // the forEach `continue`
      }

      // Gather interactable collider data
      this.roomColliderData[ roomName ][ curInteractableName ] = {};
      this.roomColliderData[ roomName ][ curInteractableName ][ 'hoverable' ] = colliderType == COLLIDER_TYPE.HOVERABLE;
      this.roomColliderData[ roomName ][ curInteractableName ][ 'clickable' ] = colliderType == COLLIDER_TYPE.CLICKABLE;
      this.roomColliderData[ roomName ][ curInteractableName ][ 'gridSize' ] = this.baseGridSize; // Unused; it's for parity with other collider types
      this.roomColliderData[ roomName ][ curInteractableName ][ 'faceVerts' ] = {};

      // Gather Face-Vertex data for interactable collider and barcentric coordinates
      for( let x = 0; x < colliderFaceCount; ++x ){
        // Get Face-Vertex positions
        //   [ [...], x1,y1,z1, x2,y2,z2, x3,y3,z3, [...] ] -> Vector3( x1, y1, z1 )
        let baseIndex = x * 9;
        let v0 = new Vector3( colliderFaceVerts[ baseIndex ], colliderFaceVerts[ baseIndex + 1 ], colliderFaceVerts[ baseIndex + 2 ] );
        let v1 = new Vector3( colliderFaceVerts[ baseIndex + 3 ], colliderFaceVerts[ baseIndex + 4 ], colliderFaceVerts[ baseIndex + 5 ] );
        let v2 = new Vector3( colliderFaceVerts[ baseIndex + 6 ], colliderFaceVerts[ baseIndex + 7 ], colliderFaceVerts[ baseIndex + 8 ] );

        // Edge vectors
        let edge0 = v1.clone().sub(v0);
        let edge1 = v2.clone().sub(v0);
        let normal = edge0.clone().cross(edge1);

        // Face-Vertex data for grid location association
        let faceKey = this.getGridKey(curInteractableName, "_", this.flattenVector3( v0 ), this.flattenVector3( v1 ), this.flattenVector3( v2 ) );
        let faceVerts = {
            "object" : collider,
            "key" : faceKey,
            "verts" : [ v0, v1, v2 ],
            "edge0" : edge0,
            "edge1" : edge1,
            "normal" : normal
          };
        this.roomColliderData[roomName][ curInteractableName ]['faceVerts'][faceKey] = faceVerts;
      }
    });
  }


  // -- -- --

  // Check if line segment intersects 2d grid edge
  //   Used for triangle edge -> grid boundary intersection detection
  isGridEdgeIntersecting( edgeStart, edgeSegment, gridXMin, gridXMax, gridZMin, gridZMax ){
        // Line segment parameters
        let dx = edgeSegment.x;
        let dz = edgeSegment.z;
        
        // Calculate intersection parameters for each grid boundary
        let txMin = dx !== 0 ? (gridXMin - edgeStart.x) / dx : Infinity;
        let txMax = dx !== 0 ? (gridXMax - edgeStart.x) / dx : -Infinity;
        let tzMin = dz !== 0 ? (gridZMin - edgeStart.z) / dz : Infinity;
        let tzMax = dz !== 0 ? (gridZMax - edgeStart.z) / dz : -Infinity;
        
        // Find intersection interval
        let tMin = Math.max(Math.min(txMin, txMax), Math.min(tzMin, tzMax));
        let tMax = Math.min(Math.max(txMin, txMax), Math.max(tzMin, tzMax));
        
        // Line intersects if tMax >= tMin and intersection occurs within segment (0 <= t <= 1)
        return tMax >= tMin && tMax >= 0 && tMin <= 1;
  }

  // -- -- --

  // Simple key generation
  getGridKey( ...args ){
    let retVal = args.join( this.delimiter );
    return retVal;
  }

  // Flatten Vector3 to a string
  flattenVector3( vec ){
    return this.getGridKey( this.pxlUtils.toNearestStr(vec.x), this.pxlUtils.toNearestStr(vec.y), this.pxlUtils.toNearestStr(vec.z) );
  }


  // -- -- --

  // Add face to grid location by its `facekey`
  addFaceToGridLocation( roomName, colliderType, gridX, gridZ, faceKey ){
    // All your keys are belong to us!
    let gridKey = this.getGridKey(gridX, gridZ);

    // Add an empty array should it not exist
    if (!this.roomColliderData[roomName][ colliderType ]['faceGridGroup'][gridKey]) {
      this.roomColliderData[roomName][ colliderType ]['faceGridGroup'][gridKey] = [];
    }

    // Map of grid locations to [ ..., face keys, ... ]
    this.roomColliderData[roomName][ colliderType ]['faceGridGroup'][gridKey].push( faceKey );
  }

  // -- -- --

  // Moller-Trumbore triangle ray intersection
  //   The other ray casting method has issues to be worked out
  //     This is the general purpose rayCaster for now
  // Implemented to be side-non-specific, as the ray may be cast from any direction
  //   Ray intersection for front facing or back facing triangles
  //     ** This is assuming Three.js is using right-handed winding order **
  //
  // Using - Scalar Triple Product; Cramer's Rule - Determinant of a 3x3 matrix
  //   u = (origin - v0) . (direction x edge1) / (edge0 . (direction x edge1))
  //   v = (origin - v0) . (edge0 x direction) / (edge0 . (direction x edge1))
  //   t = (v1 - origin) . (edge1 x direction) / (edge0 . (direction x edge1))
  // Pages 4 & 5 -
  //   https://cadxfem.org/inf/Fast%20MinimumStorage%20RayTriangle%20Intersection.pdf
  //
  castRay( roomName, origin, direction, colliderType=COLLIDER_TYPE.FLOOR, geoSide=GEOMETRY_SIDE.DOUBLE, multiHits=true ){
    
    if( !this.roomColliderData.hasOwnProperty( roomName ) || !this.roomColliderData[ roomName ].hasOwnProperty( colliderType ) ){
      this.error( "Room '" + roomName + "' does not have collider data for type: " + colliderType );
      this.error( " -- Please register any collider objects with `pxlColliders.prepColliders()` or `pxlColliders.prepInteractables` first -- " );
      return [];
    }

    let roomData = this.roomColliderData[roomName][colliderType];
    let gridSize = roomData['gridSize'];
    let gridSizeInv = 1 / gridSize;
    let gridX = Math.floor(origin.x * gridSizeInv);
    let gridZ = Math.floor(origin.z * gridSizeInv);
    let gridKey = this.getGridKey(gridX, gridZ);

    // Default checks for front and back facing triangles
    let backFaceCheck = 1;
    let frontFaceCheck = 1;
    if( geoSide == GEOMETRY_SIDE.FRONT ){
      backFaceCheck = 0;
    }else if( geoSide == GEOMETRY_SIDE.BACK ){
      frontFaceCheck = 0;
    }

    if (!roomData['faceGridGroup'].hasOwnProperty(gridKey)) return [];
    let faceKeys = roomData['faceGridGroup'][gridKey];
    //let faceKeys = Object.keys( roomData['faceVerts'] );

    let hits = [];
    let retHits = {};


    faceKeys.forEach(faceKey => {
      let faceVerts = roomData['faceVerts'][faceKey];
      let v0 = faceVerts['verts'][0];
      //let v1 = faceVerts['verts'][1];
      //let v2 = faceVerts['verts'][2];

      let edge0 =  faceVerts['edge0']; // v1.clone().sub(v0);
      let edge1 =  faceVerts['edge1']; // v2.clone().sub(v0);
      let directionCross = direction.clone().cross(edge1);
      let isFacing = edge0.dot( directionCross ); // Determinant of the matrix

      // Triangle is parallel to the ray
      //   This allows negative facing triangles to be detected
      if( isFacing*backFaceCheck > -this.epsilon && isFacing*frontFaceCheck < this.epsilon ) return; // This ray is parallel to this triangle.

      // Calculate barycentric coordinates
      
      let edgeOrig = origin.clone().sub(v0);
      let u = edgeOrig.dot( directionCross );

      if( u < 0.0 || u > isFacing ) return; // Invalid barcentric coordinate, outside of triangle

      let crossOrig = edgeOrig.clone().cross(edge0);
      let v = direction.dot( crossOrig );

      if( v < 0.0 || u + v > isFacing) return; // Invalid barcentric coordinate, outside of triangle

      let factor = 1.0 / isFacing; // Inverted Determinant to reduce divisions, Scale factor for ray intersection
      u *= factor;
      v *= factor;

      let dist = factor * edge1.dot( crossOrig ); // 'dist' is 't' in the Moller-Trumbore algorithm

      if( dist > this.epsilon ){ // ray intersection
        let intersectionPoint = origin.clone().add( direction.clone().multiplyScalar(dist) );
        retHits[ dist ] = {
          'object' : faceVerts['object'],
          'pos' : intersectionPoint,
          'dist' : dist
        };
      }
    });

    // Find closest intersection point to the origin
    let distKeys = Object.keys( retHits );
    distKeys.sort();
    let retArr = [];
    for( let x = 0; x < distKeys.length; ++x ){
      retArr.push( retHits[ distKeys[x] ] );
    }

    // Update active face in collision helper object, if exists
    if( roomData[ 'helper' ] ){
      let curFace = retArr.length > 0 ? retArr[0] : -1;
      this.setHelperActiveFace( roomName, colliderType, curFace );
    }

    return retArr;
  }

  // -- -- --

  // ** Currently not 100% correct, user castRay() for now **
  //
  // Returns array of collision positions on the collider, sorted by distance from the origin
  //   Each object in the array contains -
  // "object" : Collided Three.js object
  // "pos" : Vector3 position of the collision
  // "dist" : Distance from the origin
  castGravityRay( roomName, origin, colliderType=COLLIDER_TYPE.FLOOR, multiHits=true ){
    // Check if collider type exists in the room's collider data
    if( !this.roomColliderData.hasOwnProperty( roomName ) || !this.roomColliderData[roomName].hasOwnProperty( colliderType ) ){
      return [];
    }
    
    let roomData = this.roomColliderData[ roomName ][ colliderType ];
    let gridSize = roomData[ 'gridSize' ];
    let faceGridGroup = roomData[ 'faceGridGroup' ];

    // Find the grid location of the origin
    let gridSizeInv = 1 / gridSize;
    let gridX = Math.floor(origin.x * gridSizeInv);
    let gridZ = Math.floor(origin.z * gridSizeInv);
    let gridKeyArr = [
        this.getGridKey( gridX-1, gridZ-1 ),
        this.getGridKey( gridX-1, gridZ ),
        this.getGridKey( gridX, gridZ-1 ),
        this.getGridKey( gridX, gridZ ),
        this.getGridKey( gridX+1, gridZ ),
        this.getGridKey( gridX, gridZ+1 ),
        this.getGridKey( gridX+1, gridZ+1 ),
      ];
    
    // Find face vert arrays for current and neighboring grid locations
    //   Since the ray is cast from the origin, it's possible that the origin is not within a face,
    //     Or not within the current grid location of the face
    // Parse all face ids, remove dupelicates, and find the closest face to the origin
    let faceIds = [];
    for( let x = 0; x < gridKeyArr.length; ++x ){
      if( faceGridGroup?.hasOwnProperty( gridKeyArr[x] ) ){
        faceIds.push( ...faceGridGroup[ gridKeyArr[x] ] );
      }
    }

    faceIds = Object.keys( roomData['faceVerts'] );

    // No collider faces found
    if( faceIds.length == 0 ){
      return [];
    }

    // Python really has ruined me for removing dupelicates, `list( set( (...) ) )`
    //   I love golfing when I can!
    faceIds = [...new Set( faceIds )];

    let retPositions = {};

    //console.log( faceIds.length );

    // Find face vert arrays for the grid location
    for( let x = 0; x < faceIds.length; ++x ){
      // Face-Vertex data
      let faceVerts = roomData[ 'faceVerts' ][ faceIds[x] ];
      let v0 = faceVerts[ 'verts' ][0];
      let v1 = faceVerts[ 'verts' ][1];
      let v2 = faceVerts[ 'verts' ][2];


      // Get edge vectors
      let edgeOrigin = origin.clone().sub(v0);

      let faceNormal = faceVerts[ 'normal' ];
      //console.log( Object.keys( faceVerts ) );

      let distToFace = edgeOrigin.dot( faceNormal ) / faceNormal.dot( faceNormal );
      let projection = origin.clone().sub( faceNormal.clone().multiplyScalar( distToFace ) );
      
      let edge0 = v2.sub( v0 ); // faceVerts[ 'edge0' ];
      let edge1 = v1.sub( v0 ); // faceVerts[ 'edge1' ];
      let edgeProj = projection.clone().sub(v0);

      // Get Vertex-Edge relationships
      let dotE0E0 = edge0.dot( edge0 ); // faceVerts[ 'dotE0E0' ];
      let dotE0E1 = edge0.dot( edge1 ); // faceVerts[ 'dotE0E1' ];
      let dotE0EOrigin = edge0.dot( edgeProj );
      let dotE1E1 = edge1.dot( edge1 ); // faceVerts[ 'dotE1E1' ];
      let dotE1EOrigin = edge1.dot( edgeProj );

      // Calculate triangle area and barycentric coordinates
      let areaInv = (dotE0E0 * dotE1E1 - dotE0E1 * dotE0E1); // faceVerts[ 'areaInv' ];
      if( areaInv == 0 ) continue; // Triangle is degenerate
      areaInv = 1 / (dotE0E0 * dotE1E1 - dotE0E1 * dotE0E1); // faceVerts[ 'areaInv' ];
      let u = (dotE1E1 * dotE0EOrigin - dotE0E1 * dotE1EOrigin) * areaInv;
      let v = (dotE0E0 * dotE1EOrigin - dotE0E1 * dotE0EOrigin) * areaInv;

      //console.log( dotE0E0, dotE0E1, dotE0EOrigin, dotE1E1, dotE1EOrigin );
      //console.log( areaInv, u, v );
      if( u >= 0 && v >= 0 && (u + v) < 1 ){
        // Intersection found
        //   Return collision position on face
        let intersectionPoint = v0.clone().add(edge0.multiplyScalar(u)).add(edge1.multiplyScalar(v));

        //console.log( "--", intersectionPoint );

        // Store distance for sorting
        let dist = origin.distanceTo(intersectionPoint);

        let intersectData = {
          "object" : faceVerts[ 'object' ],
          "pos" : intersectionPoint,
          "dist" : dist
        }

        retPositions[dist] = intersectData;

        if( !multiHits ){
          return [intersectData];
        }
      }
    }

    // Find closest intersection point to the origin
    let distKeys = Object.keys( retPositions );
    distKeys.sort();
    let retArr = [];
    for( let x = 0; x < distKeys.length; ++x ){
      retArr.push( retPositions[ distKeys[x] ] );
    }

    // Update active face in collision helper object, if exists
    if( roomData[ 'helper' ] ){
      let curFace = retArr.length > 0 ? retArr[0] : -1;
      this.setHelperActiveFace( roomName, colliderType, curFace );
    }

    return retArr;
  }

  // -- -- -- 

  // 'objectInteractList' is an array of Three.js objects
  // 'camera' is a three.js camera object
  // 'screenUV' is a Vector2 of the screen position in NDC, from -1 to 1
  //   If needed, run `pxlNav.pxlUtils.screenToNDC( mX,mY, swX,swY )` to convert screen position to NDC before passing to this function
  castInteractRay( roomName, objectInteractList=[], camera=null, screenUV=Vector2(0.0, 0.0), multiHits=true ){

    // Calculate ray direction & origin
    let cameraRay = new Vector3( 0, 0, 0 );
    camera.getWorldDirection( cameraRay );
    let rayOrigin = camera.position.clone();
    
    // Calculate frustum dimensions using FOV and aspect ratio
    let fovRadians = camera.fov * this.degToRad;
    let tanFov = Math.tan(fovRadians * .5);
    let aspectRatio = camera.aspect;

    // Calculate ray direction in camera space
    let dirX = screenUV.x * aspectRatio * tanFov;
    let dirY = screenUV.y * tanFov;
    let dirZ = -1; // Forward in camera space

    // Create direction vector and transform to world space
    let rayDirection = new Vector3(dirX, dirY, dirZ)
        .applyMatrix4(camera.matrixWorld)
        .sub(camera.position)
        .normalize();

    // -- -- --

    let retClickedObjects = {};

    objectInteractList.forEach(( curObj )=>{
      let curName = curObj.name;

      // TODO : Add check for current object Face-Vertex data; build if not found
      //if( !this.roomColliderData[ roomName ].hasOwnProperty( curName ) ){
      //  this.prepInteractables( curObj );
      //}

      // Iterate Face-Vertex data for current object
      let curFaceData = this.roomColliderData[ roomName ][ curName ];
      let objFaceVerts = curFaceData[ 'faceVerts' ];
      let faceVertKeys = Object.keys( objFaceVerts );
      //console.log( faceVertKeys );
      faceVertKeys.forEach(( curFaceKey )=>{
        let curFace = objFaceVerts[ curFaceKey ];
        let v1 = curFace[ 'verts' ][0];
        let v2 = curFace[ 'verts' ][1];
        let v3 = curFace[ 'verts' ][2];

        // Get edge vectors
        let edge0 = curFace[ 'edge0' ];
        let edge1 = curFace[ 'edge1' ];
        let normal = curFace[ 'normal' ];

        // Check if ray and triangle are parallel
        let NDotRay = normal.dot(rayDirection);
        if( Math.abs(NDotRay) < 0.000001 ) return;  // Ray parallel to triangle

        // Calculate distance from ray origin to triangle plane
        let d = normal.dot(v1); // TODO : Verify this is the correct
        let dist = (d - normal.dot(rayOrigin)) / NDotRay;

        if( dist < 0 ) return;  // Triangle is behind ray

        // Calculate intersection point
        let intersection = rayOrigin.clone().add(rayDirection.clone().multiplyScalar( dist ));

        // Calculate barycentric coordinates
        let va = v1.clone().sub(intersection);
        let vb = v2.clone().sub(intersection);
        let vc = v3.clone().sub(intersection);

        let na = vb.clone().cross(vc).length();
        let nb = vc.clone().cross(va).length();
        let nc = va.clone().cross(vb).length();
        let total = na + nb + nc;

        // Calculate barycentric coordinates
        let u = na / total;
        let v = nb / total;
        let w = nc / total;

        // Check if ray intersects triangle
        if( u >= 0 && u <= 1 && v >= 0 && v <= 1 && w >= 0 && w <= 1 ) {
          // Intersection found
          //   Return collision position on face
          let intersectionPoint = v1.clone().add(edge0.multiplyScalar(u)).add(edge1.multiplyScalar(v));

          //console.log( "--!!--", intersectionPoint );

          // Store distance for sorting
          let dist = rayOrigin.distanceTo(intersectionPoint);
          retClickedObjects[dist] = { 
            'obj' : curObj,
            'pos' : intersection
          };

          if( !multiHits ) {
            return { 
              'obj' : curObj,
              'pos' : intersection
            };
          }
        }
      });
    });

    // Sort by closest intersection point to the camera
    let distKeys = Object.keys( retClickedObjects );
    distKeys.sort();
    let retArr = {};
    retArr[ 'order' ] = [];
    retArr[ 'hits' ] = {};
    retArr[ 'hitCount' ] = 0;
    for( let x = 0; x < distKeys.length; ++x ){
      let curObj = retClickedObjects[ distKeys[x] ][ 'obj' ];
      let curIntersect = retClickedObjects[ distKeys[x] ][ 'pos' ];
      let curName = curObj.name;
      retArr[ 'order' ].push( curObj );

      if(  !retArr[ 'hits' ].hasOwnProperty( curName ) ){
        retArr[ 'hits' ][ curName ] = [];
      }
      retArr[ 'hits' ][ curName ].push( curIntersect );
      retArr[ 'hitCount' ]++;
    }

    return retArr;
  }

  // -- -- -- -- -- -- -- -- -- -- --

  //////////////////////////////////////////////////
  // Helper Functions for Collider Visualization //
  ////////////////////////////////////////////////

  // Face ID To Color ID
  //   Fit color to limit for easier visual identification
  toColorId( faceId, limit=256 ){
    let limitInv = 1.0 / limit;
    let redLimit = 1.0 / (limit * limit);
    // -- -- --
    let redId = Math.floor( faceId * redLimit ) % limit;
    let greenId = Math.floor( faceId * limitInv ) % limit;
    let blueId = faceId % limit;
    // -- -- --
    return  [ redId*limitInv, greenId*limitInv, blueId*limitInv ];
  }

  // Generate a random color ID list for visual identification
  //   This will shift neighboring triangles to different colors
  getRandomColorIdList( count=64 ){
    let colorIdList = Array.from({length: count}, (_, x) => { return x });
    let stepSize = parseInt( Math.floor( colorIdList.length / 3 ) );

    // If stepSize is even, make it odd
    stepSize += (stepSize & 0x0001)==0 ? 1 : 0;

    let randomColorIdList = [];
    for( let x = 0; x < count; ++x ){
      if( colorIdList.length == 0 ){ // Should never run, but just in case
        break;
      }else if( colorIdList.length == 1 ){
        randomColorIdList.push( colorIdList.pop() );
        break;
      }
      let curComponent = (stepSize*x) % colorIdList.length;
      let curEntry = colorIdList.splice( curComponent , 1 );
      randomColorIdList.push( curEntry[0] );
    }
    return randomColorIdList;
  }

    
  // Display known triangles as a visual red when in the users grid
  //  The intersected triangle will be displayed as a green triangle
  buildHelper( roomObj, colliderType=COLLIDER_TYPE.FLOOR ){
    let roomName = roomObj.getName();
    let roomData = this.roomColliderData[ roomName ][ colliderType ];
    let triCount = roomData[ 'count' ];

    this.log( "Building helper for " + roomName + " with " + triCount + " triangles" );

    // Create a geometry to hold all triangles
    let geometry = new BufferGeometry();

    // Arrays to hold vertices and visibility attributes
    let vertices = [];
    let colorId = [];
    let visibility = [];

    let colorIdList = this.getRandomColorIdList( triCount );

    let colorLimit = parseInt( triCount ** .5 );
    let posYShift = 0.1;

    // Iterate through all face vertices in roomData
    Object.keys(roomData['faceVerts']).forEach((faceKey, index) => {
      let faceVerts = roomData['faceVerts'][faceKey]['verts'];

      // Push vertices for each triangle
      vertices.push( faceVerts[0].x, faceVerts[0].y + posYShift, faceVerts[0].z );
      vertices.push( faceVerts[1].x, faceVerts[1].y + posYShift, faceVerts[1].z );
      vertices.push( faceVerts[2].x, faceVerts[2].y + posYShift, faceVerts[2].z );

      // Push visibility attribute for each vertex (default to 0, meaning not visible)
      visibility.push( 0, 0, 0 );

      // Set unique color for each triangle
      let curColorId = this.toColorId( colorIdList[index], colorLimit );
      colorId.push( ...curColorId, ...curColorId, ...curColorId );

    });

    // Convert arrays to Float32Array
    let verticesArray = new Float32Array( vertices );
    let colorIdArray = new Float32Array( colorId );
    let visibilityArray = new Float32Array( visibility );


    // Set attributes for geometry
    geometry.setAttribute( 'position', new BufferAttribute( verticesArray, 3 ) );
    geometry.setAttribute( 'colorId', new BufferAttribute( colorIdArray, 3 ) );
    geometry.setAttribute( 'visibility', new BufferAttribute( visibilityArray, 1 ) );

    // Create a material with a shader that can toggle visibility based on vertex attributes
    let material = new ShaderMaterial({
      uniforms: {
      visibleFaceId: { value: -1 } // Default to -1, meaning no face is green
      },
      vertexShader: `
        uniform float visibleFaceId;

        attribute vec3 colorId;
        attribute float visibility;

        varying vec4 vCd;
        varying float vVisibility;

        void main() {
          vVisibility = visibility*.5+.5;
          
          vCd = vec4( normalize(colorId), 0.50 ); // Pre-calculated Blue for visible face
          if (visibleFaceId == 1.0) {
            vCd = vec4( 0.0, 1.0, 0.0, 1.0 ); // Green for visible face
          }

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec4 vCd;
        varying float vVisibility;

        void main() {

          vec4 Cd = vCd;
          //Cd.a *= vVisibility;
          //Cd.rgb = vec3( vVisibility );

          gl_FragColor = Cd;
        }
      `,
    });


    material.side = DoubleSide;
    material.transparent = true;
    material.depthTest = true;
    material.depthWrite = false;
    material.blending = AdditiveBlending;

    // Create mesh and add to the scene
    let mesh = new Mesh(geometry, material);
    mesh.renderOrder = 2;

    // Store the mesh for later use
    this.roomColliderData[ roomName ][ colliderType ][ 'helper' ] = mesh;

    return mesh;

  }

  // Update vertex attributes to current grid location
  stepHelper( roomObj, colliderType=COLLIDER_TYPE.FLOOR ){
    let roomName = roomObj.getName();
    let roomData = this.roomColliderData[ roomName ][ colliderType ];
    let helperMesh = roomData[ 'helper' ];
    let faceGridGroup = roomData[ 'faceGridGroup' ];


    // Get current grid location
    let gridSize = roomData[ 'gridSize' ];
    let gridSizeInv = 1 / gridSize;
    let gridX = Math.floor(roomObj.position.x * gridSizeInv);
    let gridZ = Math.floor(roomObj.position.z * gridSizeInv);
    let gridKey = this.getGridKey(gridX, gridZ);

    // Get all face keys in the current grid location
    let faceKeys = faceGridGroup[gridKey];

    if( this.prevGridKey == gridKey ){
      return;
    }

    // Update face-vertex visibility attribute based on grid location
    let geometry = helperMesh.geometry;
    let visibility = geometry.attributes.visibility;
    let visibilityArray = visibility.array;
    /*for (let i = 0; i < visibilityArray.length; i++) {
      visibilityArray[i] = 0;
    }*/

    // Set visibility to 1 for all faces in the current grid location
    /*if (faceKeys) {
      faceKeys.forEach((faceKey) => {
        let faceVerts = roomData['faceVerts'][faceKey];
        let idx = 3 * faceVerts['idx'];
        visibilityArray[idx] = 1;
        visibilityArray[idx + 1] = 1;
        visibilityArray[idx + 2] = 1;
      });
    }*/
  }

  setHelperActiveFace( roomName, colliderType=COLLIDER_TYPE.FLOOR, faceIdx=-1 ){
    let roomData = this.roomColliderData[ roomName ][ colliderType ];
    let helperMesh = roomData[ 'helper' ];

    let material = helperMesh.material;
    material.uniforms.visibleFaceId.value = faceIdx;
  }


  // -- -- -- 
  

  destroy( animName ){
    if( this.objNames.includes( animName ) ){
      this.animMixer[ animName ].stopAllAction();
      delete this.animMixer[ animName ];
      delete this.objects[ animName ];
      let idx = this.objNames.indexOf( animName );
      this.objNames.splice( idx, 1 );
    }
  }

}