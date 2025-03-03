// pxlNav Animation Manager
// -- -- -- -- -- -- -- -- --
// Written by Kevin Edzenga; 2024


import {
  Clock,
  AnimationMixer,
  MeshStandardMaterial,
} from "../../libs/three/three.module.min.js";

/**
 * @alias pxlAnim
 * @class
 * @description Animation handling
 */
export class Animation{
  constructor( assetPath=null, msRunner=null ){
    this.pxlEnv = null;
    this.assetPath=assetPath;
    this.verbose = false;
    
    this.animInitEntry = {
      'rig' : null,
      'mesh' : null,
      'mixer' : null,
      'clips' : {},

      'state' : null,
      'hasConnection' : false,
      'prevTime' : -1,
      'connected' : [],
      'connections' : {}
    }
    
    this.objNames = [];
    this.objects = {};
    this.animMixer = {};
    this.msRunner=msRunner;
    this.clock = new Clock();
  }
  setDependencies( pxlEnv ){
    this.pxlEnv = pxlEnv;
  }
  log( msg ){
    if( this.verbose ){
      console.log( msg );
    }
  }

  /**
   * Initialize an object for animation
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @param {Object} animFbx - The FBX object to animate
   */
  initObject( animName, animFbx ){
    
    let animRoot = null;
    let bindObj = null;
    let runCount = animFbx.children.length;
    let x = 0;
    let checkList = [...animFbx.children];
    let meshCount = 0;
    let boneCount = 0;
    let SkinnedMeshCount = 0;
    let GroupCount = 0;
    while( x < runCount ){
      let c = checkList[x];
      switch( c.type ){
        case "Bone":
          ++boneCount;
          animRoot = c;
          break;
        case "Mesh":
          ++meshCount;
          c.visible = false;
          break;
        case "SkinnedMesh":
          ++SkinnedMeshCount;
          bindObj = c;
          break;
        case "Group":
          ++GroupCount;
          checkList = checkList.concat( c.children );
          runCount = checkList.length;
          break;
        default:
          break;
      }
      ++x;
    }

    let error = false;
    if( !animRoot ){
      this.log("Error, No Bone/Rig Root Found; Please move your rig to the scene's root. Grouped rigs aren't supported yet.");
      error = true;
    }
    if( !bindObj ){
      this.log("Error, No SkinnedMesh Found; Please ensure your rig has a mesh to animate.");
      error = true;
    }
    if( error ){
      console.log( "Unable to prepare '"+animName+"' for animation" );

      console.log( "Group Count: "+GroupCount );
      console.log( "Bone Root Found : "+(boneCount>0) );
      console.log( "Bone Count : "+boneCount );
      console.log( "Mesh Count: "+meshCount );
      console.log( "SkinnedMesh Count: "+SkinnedMeshCount );
      return;
    }


    console.log( animFbx)

    if( !this.objNames.includes( animName ) ){
      this.objNames.push( animName );
      let outDict = Object.assign({}, this.animInitEntry);
      outDict[ 'rig' ] = animRoot;
      outDict[ 'mesh' ] = bindObj;
      this.animMixer[ animName ] = new AnimationMixer( animRoot );
      outDict[ 'mixer' ] = this.animMixer[ animName ];
      this.objects[ animName ] = outDict;

      let skinnedMaterial = new MeshStandardMaterial();
      skinnedMaterial.map = bindObj.material.map;

      bindObj.material = skinnedMaterial;
    }
  }
  
  /**
   * Add a clip to an object
   *   Use `pxlFile.loadAnimFBX() to load your animation clips`
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @param {string} clipName - The name of the clip to add
   * @param {Object} animFbx - The FBX object to animate
   * @example
   * // Add a clip to an object
   * pxlAnim.addClips( "myAnim", "myClip", fbxLoader_animationCycleRoot );
   */
  addClips( animName, clipName, animFbx ){
    if( !this.objNames.includes( animName ) ){
      this.log("Error, '"+animName+"' not found in Animation Manager");
      return;
    }
    let clipNames = Object.keys( this.objects[ animName ][ 'clips' ] );
    if( clipNames.includes( clipName ) ){
      this.log("Warning, '"+clipName+"' already exists in '"+animName+"'");
    }
    let animMixer = this.animMixer[ animName ];
    //console.log(animFbx.animations);

    // TODO : Add support for objects to reuse animation sources

    let newClip = animMixer.clipAction( animFbx.animations[0] );
    this.objects[ animName ][ 'clips' ][ clipName ] = newClip;

  }


  /**
   * Check if an object has a clip
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @param {string} clipName - The name of the clip to check for
   * @returns {boolean} - True if the object has the clip
   * @example
   * // Check if an object has a clip
   * let hasClip = this.pxlAnim.hasClip( this.animRigName, "myClipName" );
   * console.log( hasClip );
   */
  hasClip( animName, clipName ){
    if( this.objNames.includes( animName ) ){
      let clipNames = Object.keys( this.objects[ animName ][ 'clips' ] );
      return clipNames.includes( clipName );
    }
    return false;
  }

  /**
   * Get the current state of an object
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @returns {string} - The current state of the object
   * @example
   * // Get the current state of an object
   * let curState = this.pxlAnim.getMixer( this.animRigName );
   * console.log( curState );
   */
  getMixer( animName ){
    if( this.objNames.includes( animName ) ){
      return this.animMixer[ animName ];
    }
    return null;
  }

  /**
   * Get animation rig of an object
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @returns {Object} - The rig object of the animation object
   * @example
   * // Get animation rig of an object
   * let rig = this.pxlAnim.getRig( this.animRigName );
   * console.log( rig );
   */
  getRig( animName ){
    if( this.objNames.includes( animName ) ){
      return this.objects[ animName ][ 'rig' ];
    }
    return null;
  }

  /**
   * Get mesh of the rigged object
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @returns {Object} - The mesh object of the animation object
   * @example
   * // Get mesh of the rigged object
   * let mesh = this.pxlAnim.getMesh( this.animRigName );
   * console.log( mesh );
   */
  getMesh( animName ){
    if( this.objNames.includes( animName ) ){
      return this.objects[ animName ][ 'mesh' ];
    }
    return null;
  }

  /**
   * Play a clip on an object
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @param {string} clipName - The name of the clip to play
   * @example
   * // Play a clip on an object
   * this.pxlAnim.playClip( this.animRigName, "myClipName" );
   */
  playClip( animName, clipName ){
    if( this.objNames.includes( animName ) ){
      let clipNames = Object.keys( this.objects[ animName ][ 'clips' ] );
      if( clipNames.includes( clipName ) ){
        let clip = this.objects[ animName ][ 'clips' ][ clipName ];
        this.objects[ animName ][ 'state' ] = clipName ;
        this.objects[ animName ][ 'prevTime' ] = -1 ;
        this.objects[ animName ][ 'hasConnection' ] = this.objects[ animName ][ 'connected' ].includes( clipName );

        this.setWeight( animName, clipName, 1, true );

        clip.reset();
        clip.play();
      }
    }
  }
  /**
   * Set blend weights of animation cycle in the mixer
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @param {string} clipName - The name of the clip to set weight for
   * @param {number} weight - The weight to set
   * @param {boolean} disableOthers - Disable other clips in the mixer
   * @example
   * // Set blend weights of animation cycle in the mixer
   * //this.pxlAnim.setWeight( this.animRigName, "myClipName", 1, true );
   * this.pxlAnim.setWeight( this.animRigName, "myClipName", 0.5, false );
   * //this.pxlAnim.setWeight( this.animRigName, "myClipName", 0.25, true );
   */
  setWeight( animName, clipName, weight, disableOthers=false ){
    if( this.objNames.includes( animName ) ){
      let clipNames = Object.keys( this.objects[ animName ][ 'clips' ] );
      if( clipNames.includes( clipName ) ){
        let clip = this.objects[ animName ][ 'clips' ][ clipName ];
        clip.enabled = true;
        clip.setEffectiveTimeScale( 1 );
        clip.setEffectiveWeight( weight );
        if( disableOthers ){
          clipNames.forEach( (clipKey)=>{
            if( clipKey != clipName ){
              let nonClip = this.objects[ animName ][ 'clips' ][ clipKey ];
              nonClip.enabled = false;
              nonClip.setEffectiveTimeScale( 1 );
              nonClip.setEffectiveWeight( 0 );
            }
          });
        }
      }
    }
  }

  /**
   * Set animation cycle speed in the mixer
   * 
   * This is handled when the FBX is loaded, this is visible for the example
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @param {string} clipName - The name of the clip to set speed for
   * @param {number} speed - The speed to set
   * @example
   * // Set animation cycle speed in the mixer
   * constructor(){
   *     this.animSource = {
   *       "RabbitDruidA" : {
   *         "rig" : this.assetPath+"RabbitDruidA/RabbitDruidA_rig.fbx",
   *         "anim" : {
   *           "Sit_Idle" : this.assetPath+"RabbitDruidA/RabbidDruidA_anim_sit_idle.fbx",
   *           "Sit_Stoke" : this.assetPath+"RabbitDruidA/RabbidDruidA_anim_sit_stoke.fbx",
   *           "Sit_Look" : this.assetPath+"RabbitDruidA/RabbidDruidA_anim_sit_look.fbx"
   *         },
   *         "stateConnections"  : {
   *           // Non existing states will be ignored and loop'ed, ie "Walk"
   *           "Sit_Idle" : [ ...Array(6).fill("Sit_Idle"), ...Array(6).fill("Sit_Stoke"), ...Array(5).fill("Sit_Look")],
   *           "Sit_Stoke" : ["Sit_Idle"],
   *           "Sit_Look" : ["Sit_Idle"]
   *         }
   *       }
   *     };
   *   }
   */
  setStateConnections( animName, stateConnections ){
    if( this.objNames.includes( animName ) ){
      let stateKeys = Object.keys( stateConnections );
      this.objects[ animName ][ 'connected' ] = stateKeys;
      this.objects[ animName ][ 'connections' ] = stateConnections;
    }
  }

  // -- -- --
  
  // Rudimentary State Machine Implementation
  // If the current state has 'connections',
  //   It'll random pick form those possible states
  // If no outgoing connections, it'll loop the current state
  step( animName ){
    if( this.objNames.includes( animName ) ){
      let hasConnection = this.objects[ animName ][ 'hasConnection' ];
      if( !hasConnection ){
        this.animMixer[ animName ].update( this.clock.getDelta() );
        return;
      }

      let curState = this.objects[ animName ][ 'state' ];
      if( curState ){ // Dunno why this would never be set when 'hasConnection' is set, sanity check
        let curClip = this.objects[ animName ][ 'clips' ][ curState ];
        let curTime = curClip.time;
        let prevTime = this.objects[ animName ][ 'prevTime' ];

        // Cycle loop check
        if( prevTime > curTime ){
          let nextStates = this.objects[ animName ][ 'connections' ][ curState ];
          let randState = nextStates[ Math.floor( Math.random() * nextStates.length ) ];
          this.playClip( animName, randState );
        }else{
          this.animMixer[ animName ].update( this.clock.getDelta() );
          this.objects[ animName ][ 'prevTime' ] = curTime;
        }
      }else{
        this.animMixer[ animName ].update( this.clock.getDelta() );
      }
    }
  }

  // -- -- -- 

  /**
   * Destroy a rig + animation objects of the provided animation name
   * @method
   * @memberof pxlAnim
   * @param {string} animName - The name of the animation object
   * @example
   * // Destroy a rig + animation objects of the provided animation name
   * this.pxlAnim.destroy( "myAnim" );
   */
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