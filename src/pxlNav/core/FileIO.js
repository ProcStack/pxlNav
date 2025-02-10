// Core File IO Helper Utilities
// -- -- -- --

import {
  Vector2,
  Vector3,
  Color,
  Group,
  Mesh,
  InstancedMesh,
  DoubleSide,
  FrontSide,
  BackSide,
  DynamicDrawUsage,
  Matrix4,
  Quaternion,
  Euler,
  Box3,
  ShaderMaterial,
  LinearSRGBColorSpace,
  SRGBColorSpace,
  NoColorSpace,
  LOD,
  SpotLight
} from "../../libs/three/three.module.min.js";
import { FBXLoader } from "../../libs/three/FBXLoader.js";
import { VERBOSE_LEVEL } from "./Enums.js";

export class FileIO{
  constructor( folderDict={}){
    this.pxlTimer=null;
    this.pxlUtils=null;
    this.pxlQuality=null;
    this.pxlEnums=null;
    this.pxlVideo=null;
    this.pxlCamera=null;
    this.pxlAutoCam=null;
    this.pxlUser=null;
    this.pxlEnv=null;
    this.pxlAnim=null;
    this.pxlDevice=null;
    this.pxlShaders=null;
    this.pxlColliders=null;

    this.verbose = false;

    this.pxlOptions={};
    
    // Turn on Verbose Logging to Javascript Console
    this.runDebugger = false;

    this.assetRoot = this.findInDict( folderDict, "assetRoot", "images/assets/" );
    this.guiRoot = this.findInDict( folderDict, "guiRoot", "images/GUI/" );
    this.roomRoot = this.findInDict( folderDict, "roomRoot", "images/rooms/" );
    this.vidRoot = this.findInDict( folderDict, "vidRoot", "images/screenContent/" );
    
    this.workerList = [];

    // No need for these to be in a Consts.js file yet
    this.oneTwoPFour = 1.0/2.4;
    this.twelvePNineTwoDiv = 1.0/12.92;
    this.onePOFiveFiveDiv = 1.0/1.055;
  }
  
  setDependencies( pxlNav ){
    this.pxlTimer=pxlNav.pxlTimer;
    this.pxlUtils=pxlNav.pxlUtils;
    this.pxlQuality=pxlNav.pxlQuality;
    this.pxlEnums=pxlNav.pxlEnums;
    this.pxlVideo=pxlNav.pxlVideo;
    this.pxlCamera=pxlNav.pxlCamera;
    this.pxlAutoCam=pxlNav.pxlAutoCam;
    this.pxlUser=pxlNav.pxlUser;
    this.pxlEnv=pxlNav.pxlEnv;
    this.pxlAnim=pxlNav.pxlAnim;
    this.pxlDevice=pxlNav.pxlDevice;
    this.pxlShaders=pxlNav.pxlShaders;
    this.pxlColliders=pxlNav.pxlColliders;
    this.pxlOptions=pxlNav.pxlOptions;

    this.verbose = this.pxlOptions.verbose;
  }

  log(...logger){
    if( this.runDebugger ||
       this.verbose >= this.pxlEnums.VERBOSE_LEVEL.DEBUG
    ){
      console.log("---");
      logger.forEach( (l)=>{ console.log(l); } );
      //logger= logger.length<2 ? logger[0] : logger;
      //console.log(logger);
    }
  }
  
  toggleDebugger( val=null ){
    if( !val ){
      val = !this.runDebugger;
    }
    this.runDebugger = val;
  }

  findInDict( dict, key, def ){
    if( dict.hasOwnProperty(key) ){
      return dict[key];
    }else{
      dict[key]=def;
      return def;
    }
  }

  // -- -- --

  convertVertColor( meshObj, space=this.pxlEnums.COLOR_SHIFT.KEEP ){
    if (meshObj.geometry && meshObj.geometry.attributes && meshObj.geometry.attributes.color) {
      let colors = meshObj.geometry.attributes.color;
      for( let x=0; x<colors.count; ++x ){
        let color = new Color().fromBufferAttribute(colors, x);
        this.pxlUtils.convertColor(color, space);
        colors.setXYZ(x, color.r, color.g, color.b);
      }
      colors.needsUpdate = true;
    }
  }

  // -- -- --

  // Check for UserData on the Mesh
  // envObj = Environment Class Object
  // envScene = Environment ThreeJS Scene Object
  // mesh = Current Object To Check For UserData Entries
  checkForUserData( envObj, envScene, mesh ){
    if( mesh.hasOwnProperty("userData") ){
      if( mesh.hasOwnProperty("material") ){
        if( mesh.userData.hasOwnProperty("doubleSided") && mesh.userData.doubleSided ){
          mesh.material.side=DoubleSide;
        }else{
          mesh.material.side=FrontSide;
        }
      }

      // Add to Glow render pass; ran by blurComposer
      if( mesh.userData.hasOwnProperty("GlowPass") && mesh.userData.GlowPass ){
        if( !envObj.geoList['GlowPass'] ){
          envObj.geoList['GlowPass'] = [];
        }
        mesh.layers.set( this.pxlEnums.RENDER_LAYER.GLOW )
        envObj.geoList['GlowPass'].push(mesh);
      }
      if( mesh.userData.hasOwnProperty("GlowPassMask") && mesh.userData.GlowPass ){
        if( !envObj.geoList['GlowPassMask'] ){
          envObj.geoList['GlowPassMask'] = [];
        }
        mesh.layers.set( this.pxlEnums.RENDER_LAYER.GLOW_MASK )
        envObj.geoList['GlowPassMask'].push(mesh);
      }
      
      if( mesh.userData.hasOwnProperty("castShadow") && mesh.userData.castShadow ){
        mesh.castShadow=true;
      }
      if( mesh.userData.hasOwnProperty("receiveShadow") && mesh.userData.receiveShadow ){
        mesh.receiveShadow=true;
      }
      if( mesh.userData.hasOwnProperty("Shader") && mesh.userData.Shader!="" ){
        let toShader = mesh.userData.Shader.trim()
        if( !envObj.shaderGeoList ) {
          envObj.shaderGeoList={};
        }
        envObj.shaderGeoList[mesh.name]=mesh;
      }
      
      if( mesh.userData.hasOwnProperty("Emitter") && mesh.userData.Emitter != "" ){
        if( !envObj.emitterList ) {
          envObj.emitterList={};
        }
        if( !envObj.emitterList[mesh.userData.Emitter] ) {
          envObj.emitterList[mesh.userData.Emitter]={};
          envObj.emitterList[mesh.userData.Emitter]['Emitter']=[];
          envObj.emitterList[mesh.userData.Emitter]['Particles']=[];
        }
        envObj.emitterList[mesh.userData.Emitter]['Emitter'].push( mesh );
      }
      
      //Hoverable Object
      if( mesh.userData.hasOwnProperty("Hover") && mesh.userData.Hover ){
        envObj.hasHoverables=true;
        envObj.hoverableList.push(mesh);
      }
      if( mesh.userData.hasOwnProperty("Click") && mesh.userData.Click ){
        envObj.hasClickables=true;
        envObj.clickableList.push(mesh);
      }
      
      this.checkObjectInstancing( envObj, envScene, mesh );
      
      // The Scripted UserData system needs fixing...
      //   Nested Objects should be handled in the main loader
      //   Objects in general should get Parent Transforms by default
      //     Meaning no reason for Scripted outside of storing the group for future use
      if( mesh.userData.hasOwnProperty("Scripted") ){
        //envScene.add( mesh );
        
        if( !envObj.geoList.hasOwnProperty('Scripted') ){
          envObj.geoList['Scripted']={}
        }
        envObj.geoList['Scripted'][mesh.name]=mesh;
        
        let scriptChildren = mesh.children;
        scriptChildren.forEach( (g)=>{
          if( g.name.includes("Geo") ){
            let pos = mesh.position;
            let rot = mesh.rotation;
            let sc = mesh.scale;
            g.position.set( pos.x, pos.y, pos.z )
            g.rotation.set( rot.x, rot.y, rot.z )
            g.scale.set( sc.x, sc.y, sc.z )
            //g.rotation = mesh.rotation.clone() 
            //g.scale  = mesh.scale.clone()
            //g.material.side=FrontSide;
            //mesh.add(g);
            
            g.updateMatrix();
            
            // Check for child UserData
            let gChildren = g.children
            gChildren.forEach( (c)=>{
              this.checkForUserData( envObj, envScene, c )
              if( c.type == "Group" ){
              // g.add(c);
                c.position.set( pos.x+c.position.x, pos.y+c.position.y, pos.z+c.position.z )
                c.rotation.set( rot.x, rot.y, rot.z )
                c.scale.set( sc.x, sc.y, sc.z )
              }
              c.updateMatrix();
            });
            
            
          }else if( g.name.includes("Colliders") ){
            let pos = mesh.position;
            let rot = mesh.rotation;
            let sc = mesh.scale;
            //g.position.set( pos.x, pos.y, pos.z )
            //g.rotation.set( rot.x, rot.y, rot.z )
            //g.scale.set( sc.x, sc.y, sc.z )
            g.position.set( pos.x, pos.y, pos.z )
            g.rotation.set( rot.x, rot.y, rot.z )
            g.scale.set( sc.x, sc.y, sc.z )
            g.updateMatrix();
            g.visible=false;
            //mesh.add(g);
          }
        });
      }
    }
  }

  // -- -- --
  
  checkForMeshSettings( meshObject, baseMaterial ){
    if( baseMaterial.hasOwnProperty("meshSettings") ){
      if( baseMaterial.meshSettings.hasOwnProperty("renderOrder") ){
        meshObject.renderOrder = baseMaterial.meshSettings.renderOrder;
      }
    }
  }

  // -- -- --
  
  canAppendChildren( envObj, mesh ){
    if( mesh.type != "Group" ){
      return false;
    }
    
    let ret = true;
    //if( mesh.hasOwnProperty("userData") && mesh.userData.hasOwnProperty("Scripted") && mesh.userData.Scripted ){
    if( envObj.geoList.hasOwnProperty('Scripted') && envObj.geoList.Scripted.hasOwnProperty(mesh.name) ){
      //console.log(envObj.geoList.Scripted, envObj.geoList.Scripted.hasOwnProperty(mesh.name), mesh.name)
      ret=false;
    }
    return ret;
  }
  
  canAddToScene( envObj, mesh ){
    let valid = true;
    if( mesh.hasOwnProperty("userData")
        && mesh.userData.hasOwnProperty("Instance")
        && envObj.hasOwnProperty("baseInstancesNames")
        && envObj.baseInstancesNames.hasOwnProperty(mesh.userData.Instance) ){
      valid = false;
    }
    return valid;
  }
  
  checkIsGlassLiquid( envObj, envScene, mesh, matList ){
    let isGlass = false;
    if( mesh.userData.hasOwnProperty("isGlass") && mesh.userData.isGlass ){
      isGlass=true;
    }
    if( mesh.userData.hasOwnProperty("isLiquid") && mesh.userData.isLiquid ){
      isGlass=true;
    }

    if( !isGlass ){
      return false;
    }
    
    this.log("Glass Detected - ",mesh.name);


    if(!envObj.glassGroup){
      let glassGrp=new Group();
      envObj.glassGroup=glassGrp;
      envScene.add(glassGrp);
    }


    let cBackMat=mesh.material.clone();
    mesh.material=cBackMat;
    mesh.material.transparent=true;
    mesh.material.opacity=.5;
    mesh.material.shininess=20;
    mesh.material.specular=mesh.material.color.clone();
    mesh.material.specular.r = mesh.material.specular.r*.5 +.1;
    mesh.material.specular.g = mesh.material.specular.g*.5 +.1;
    mesh.material.specular.b = mesh.material.specular.b*.5 +.1;
    
    //mesh.material.side=FrontSide;
    //mesh.material.depthTest=true;
    mesh.material.side=BackSide;
    mesh.material.depthWrite=false;
    mesh.matrixAutoUpdate=false;
    mesh.renderOrder = 1 + envObj.glassList.length;
    envObj.glassList.push(mesh);
    envObj.glassGroup.add(mesh);
    
    let cFrontGeo = mesh.geometry.clone()
    let cFrontMat= mesh.material.clone();
    cFrontMat.copy( mesh.material );
    let cFrontMesh = new Mesh( cFrontGeo, cFrontMat );
    cFrontMesh.name = mesh.name+"_Front";
    cFrontMesh.material.shininess=40;
    cFrontMesh.material.side=FrontSide;
    cFrontMesh.matrixAutoUpdate=false;
    cFrontMesh.renderOrder = 1 + envObj.glassList.length;
    
    
    let curPos=mesh.position;
    let curRot=mesh.rotation;
    let curScale=mesh.scale;
    
    cFrontMesh.rotation.set(curRot.x,curRot.y,curRot.z);
    cFrontMesh.position.set(curPos.x,curPos.y,curPos.z);
    cFrontMesh.scale.set(curScale.x,curScale.y,curScale.z);
    cFrontMesh.updateMatrix();
    

    mesh.parent.add( cFrontMesh )
    envObj.glassList.push(cFrontMesh);
    envObj.glassGroup.add(cFrontMesh);


    return isGlass;
  }
  
  // -- -- --

  // ## Make Instancing actually Instance
  //   Instancing is currently not actually instancing
  //   Object is cloned, raising ram/vram usage
  checkObjectInstancing( envObj, envScene, mesh ){

    if( !envObj.hasOwnProperty("baseInstancesNames") || !envObj.hasOwnProperty("baseInstancesList") ){
      return false;
    }

    if( mesh.hasOwnProperty("userData")
        && mesh.userData.hasOwnProperty("Instance")
        && envObj.baseInstancesList.hasOwnProperty(mesh.userData.Instance) ){
          
          let name = mesh.name;
          this.log("Generate Instance - ",name);
          
          if( !envObj.geoList.hasOwnProperty("InstanceObjects") ){
            envObj.geoList['InstanceObjects']={};
          }
          
          // -- -- --

          // Regex attribute checks --
          
          // Instance Geometry Object for LOD level N
          let lodInstanceRegex = new RegExp( /(instlod)\d+/, "i" );
          let lodNumberRegex = new RegExp( /\d+/, "i" );

          // Instance Switch Distance for LOD level N
          let lodDistRegex = new RegExp( /(instlod)\d+(dist)/, "i" );

          // Instance Mesh Point Skip Rate for LOD level N
          //   If no child mesh with lod level found,
          //     It will auto skip verts to spawn at to help with performance
          let lodSkipRegex = new RegExp( /(instlod)\d+(skip)/, "i" );

          // -- -- --

          // LOD data objects

          let lodMeshes = { 'lod0' : 
            { 
              'mesh': mesh, 
              'dist': 1 
            }
          };



          let instObjectData = {
            'mesh' : mesh,
            'instMesh' : null,
            'dist' : 1,
            'skip' : 0
          }

          // -- -- --

          // Base variables

          let hasLods = false;
          let hasInstSettings = {};
          let instanceBaseObject = null;
          let foundInstLODLevels = {};

          // -- -- --

          // Check for LOD

          try{
            let userDataKeys = Object.keys( mesh.userData );

            userDataKeys.forEach( ( dataKey )=>{
              let isInstanceLODLevel = lodInstanceRegex.test (dataKey );
              if( isInstanceLODLevel ){
                let curLevelNumber = lodNumberRegex.exec( dataKey );
                if( !curLevelNumber || curLevelNumber.length < 1 ){
                  return;
                }
                curLevelNumber = parseInt( curLevelNumber[0] );

                let levelData = {};
                if( foundInstLODLevels.hasOwnProperty( curLevelNumber ) ){
                  levelData = foundInstLODLevels[ curLevelNumber ];
                }else{
                  foundInstLODLevels[ curLevelNumber ] = Object.assign( {}, instObjectData );
                  levelData = foundInstLODLevels[ curLevelNumber ];
                }

                if( lodDistRegex.test( dataKey ) ){
                  let curDist = mesh.userData[ dataKey ];
                  levelData['dist'] = curDist;
                }else if( lodSkipRegex.test( dataKey ) ){
                  let curSkip = mesh.userData[ dataKey ];
                  levelData['skip'] = curSkip;
                }else{
                  levelData['instMesh'] = mesh.userData[ dataKey ];
                }
              }
            });
          }catch(e){
            if( this.verbose >= this.pxlEnums.VERBOSE_LEVEL.ERROR ){
              console.error(e);
            }
          }


          // -- -- --


          // Check for Child LODs levels
          let lodChildren = mesh.children;
          
          for( let x=0; x<lodChildren.length; ++x ){ 
            if( !lodChildren[x].hasOwnProperty("userData") ){
              continue;
            }
            let curUserData = lodChildren[x].userData;
            for( let c=0; c<curUserData.length; ++c ){
              let dataKey = curUserData[c];
              let curKey = lodInstanceRegex.test( dataKey );
              let curDataObj = Object.assign( {}, instObjectData );
              if( curKey ){
                let curLevelNumber = lodNumberRegex.exec( dataKey );
                let onParent = foundInstLODLevels.hasOwnProperty( curLevelNumber );
                if( onParent ){
                  curDataObj = foundInstLODLevels[ curLevelNumber ];
                }
              }
              if( lodDistRegex.test( dataKey ) ){
                let curDist = curUserData[ dataKey ];
                curDataObj['dist'] = curDist;
              }else if( lodSkipRegex.test( dataKey ) ){
                let curSkip = curUserData[ dataKey ];
                curDataObj['skip'] = curSkip;
              }else{
                curDataObj['instMesh'] = curUserData[ dataKey ];
              } 
            }
          }

          // -- -- --

          let lodKeysList = Object.keys( lodMeshes );

          try{
            if( hasLods ){
              instanceBaseObject = new LOD();
              instanceBaseObject.name = name + "_LOD_TOPLVL";
              instanceBaseObject.userData = Object.assign( {},  mesh.userData );
              instanceBaseObject.userData['pxlInstanceToMesh'] = true;
              envObj.geoList['InstanceObjects'][name] = instanceBaseObject;
              envObj.lodList.push( instanceBaseObject );
              mesh.parent.add(instanceBaseObject);
            }

            for( let x=0; x<lodKeysList.length; ++x ){
              let curMesh = lodMeshes[lodKeysList[x]].mesh;
              let curPos = curMesh.position;
              let curRot = curMesh.rotation;
              let curScale = curMesh.scale;
              let instBase = envObj.baseInstancesList[ curMesh.userData.Instance ];

              if( curMesh.type == "Mesh" ){
                let matrix = new Matrix4();
                let position = new Vector3();
                let normal = new Vector3();
                let quaternion = new Quaternion();
                let scale = new Vector3(1, 1, 1);
                const hasColor = curMesh.geometry.attributes.hasOwnProperty("color");
                let userDataKeys = Object.keys( curMesh.userData );
                let userDataKeysLower = userDataKeys.map( (c)=> c.toLowerCase() );

                let hasFitScale = false;
                let minScale = 0;
                let maxScale = 1;
                if( userDataKeysLower.includes("minscale") ){
                  hasFitScale = true;
                  minScale = curMesh.userData[ userDataKeys[ userDataKeysLower.indexOf("minscale") ] ];
                }
                if( userDataKeysLower.includes("maxscale") ){
                  hasFitScale = true;
                  maxScale = curMesh.userData[ userDataKeys[ userDataKeysLower.indexOf("maxscale") ] ];
                }

                // Prevent dupelicate instances
                //   Verts are split, so neighboring polygons have stacked vertices
                //     'entry' checks those dupes
                let pointRecorder = {};
                let instanceMatricies = [];
                for (let x = 0; x < curMesh.geometry.attributes.position.count; ++x) {
                  position.fromBufferAttribute(curMesh.geometry.attributes.position, x);
                  let entry = position.toArray();

                  // Flatten array elements to 0.01 precision joined by ","
                  entry = this.pxlUtils.flattenArrayToStr( entry );

                  if( !pointRecorder.hasOwnProperty(entry) ){
                    normal.fromBufferAttribute(curMesh.geometry.attributes.normal, x);
                    let randomRot = new Euler( 0,Math.random() * 2 * Math.PI, 0);
                    quaternion.setFromEuler(randomRot);
                    
                    curScale = scale;
                    if( hasColor ){
                      let curScalar = curMesh.geometry.attributes.color.getX(x);
                      if( hasFitScale ){
                        // Scale the object based on object parameter `minScale` & `maxScale`
                        curScalar = minScale + (maxScale - minScale) * curScalar;
                      }
                      curScale = new Vector3(curScalar, curScalar, curScalar);
                    }
                    matrix.compose(position, quaternion, curScale);
                    instanceMatricies.push( matrix.clone() );
                    pointRecorder[entry]=true;
                  }
                }
                if( instanceMatricies.length > 0 ){
                  let instancedMesh = new InstancedMesh(instBase.geometry, instBase.material, instanceMatricies.length);
                  instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage);

                  instancedMesh.userData = Object.assign( {},  curMesh.userData );
                  instancedMesh.userData['pxlInstanceToMesh'] = true;

                  /*if( instBase.material.hasOwnProperty("curMeshSettings") ){
                    if( instBase.material.curMeshSettings.hasOwnProperty("renderOrder") ){
                      instancedMesh.renderOrder = instBase.material.curMeshSettings.renderOrder;
                    }
                  }*/
                  this.checkForMeshSettings( instancedMesh, instBase.material );
                  
                  for (let x = 0; x < instanceMatricies.length; ++x) {
                    instancedMesh.setMatrixAt( x, instanceMatricies[x] );
                  }


                  instancedMesh.visible = true;
                  instancedMesh.updateMatrix();


                  if( hasLods ){

                    instancedMesh.name = name + "Geo_" + lodKeysList[x];
                    let curDist = lodMeshes[lodKeysList[x]].dist;
                    instanceBaseObject.addLevel(instancedMesh, curDist);

                  }else{

                    instancedMesh.name = name + "Geo";
                    envObj.geoList['InstanceObjects'][name] = instancedMesh;
                    curMesh.parent.add(instancedMesh);
                  }
                  curMesh.visible = false;
                  curMesh.parent.remove(curMesh);
                }
              }else{
                // Clone the base instance; single instance
                let instancedMesh = new InstancedMesh(instBase.geometry, instBase.material, 1);
                instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage);

                instancedMesh.userData = Object.assign( {},  curMesh.userData );
                instancedMesh.userData['pxlInstanceToMesh'] = false;

                this.checkForMeshSettings( instancedMesh, instBase.material );


                let altInstPlacement = false;
                if( curMesh.userData.hasOwnProperty("fixInstMatrix") ){
                  altInstPlacement = !!curMesh.userData.fixInstMatrix;
                }

                if( altInstPlacement ){
                  instancedMesh.rotation.set(curRot.x,curRot.y,curRot.z);
                  instancedMesh.position.set(curPos.x,curPos.y,curPos.z);
                  instancedMesh.scale.set(curScale.x,curScale.y,curScale.z);
                }else{
                  const matrix = new Matrix4();
                  matrix.compose(curPos, new Quaternion().setFromEuler(curRot), curScale);
                  instancedMesh.setMatrixAt(0, matrix);
                }

                instancedMesh.visible=true;
                instancedMesh.updateMatrix();

                if( hasLods ){

                  instancedMesh.name = name + "Geo_" + lodKeysList[x];
                  let curDist = lodMeshes[lodKeysList[x]].dist;
                  instanceBaseObject.addLevel(instancedMesh, curDist);

                }else{

                  instancedMesh.name = name + "Geo";
                  envObj.geoList['InstanceObjects'][name] = instancedMesh;
                  curMesh.parent.add(instancedMesh);
                }
                
                curMesh.visible=false;
                curMesh.parent.remove(curMesh);

              }
            }
          }catch(e){
            if( this.verbose >= this.pxlEnums.VERBOSE_LEVEL.ERROR ){
              console.error(e);
            }
          }

          if( this.verbose >= this.pxlEnums.VERBOSE_LEVEL.DEBUG && hasLods ){
            let status = "Failed";
            let createdLods = -1;
            let lodKeys = [];
            if( instanceBaseObject?.levels ){
              status = "Created";
              createdLods = instanceBaseObject.levels;
              lodKeys = Object.keys( createdLods );
            }

            let printText = "Instance LODs " + status + " - " + name;
            this.log( printText );
            if( lodKeys.length > 0 ){
              printText = "LOD Levels - " + createdLods;
              this.log( printText );
              this.log( instanceBaseObject );
            }
          }

          /*
          // Dupe the base object; single dupe
          
          let dupe=instBase.clone();//new Mesh(instBase.geometry.clone());
          dupe.rotation.set(curRot.x,curRot.y,curRot.z);
          dupe.position.set(curPos.x,curPos.y,curPos.z);
          dupe.scale.set(curScale.x,curScale.y,curScale.z);
           
          dupe.visible=true;
          dupe.updateMatrix();
          
          let curSide = FrontSide;
          if(instBase.userData.doubleSided){
            curSide=DoubleSide;
          }
          dupe.material.side=curSide;
          dupe.name = name+"Geo";
            
          envObj.geoList['InstanceObjects'][name]=dupe;
          mesh.parent.add( dupe );
          */
    }
  }
  
  
  
 // -- -- -- -- -- -- -- -- -- -- -- -- -- //
 // -- -- -- -- -- -- -- -- -- -- -- -- -- //
 // -- -- -- -- -- -- -- -- -- -- -- -- -- //
  
  // TODO : Apparently traversing FBX objects with no children on a leaf breaks
  //   Oh well... Just get it done
  
  // Currently only used for loading core scene assets;
  //   Initial Camera Position, Avatar Geometry, Items
  // TODO : Convert into a set of agregate lists, to allow for non-scene structure settings.
  //          If a material has transparency & reflective settings, should be flagged "glass"  
  //            Even if its not in the "Scene" group.
  loadSceneFBX(objPath, imgPath, transList, verboseLoading,meshKey,addToScene){
    if(meshKey!=''){ // Prep for IsLoaded checks
      this.pxlEnv.geoLoadListComplete=0;
      this.pxlEnv.geoLoadList[meshKey]=0;
    }
    let addedGlow=0;
    let pingCount=0;
    
    var fbxLoader=new FBXLoader();
    fbxLoader.load( objPath, (curFbx)=>{
      let groups=curFbx.children;
      let groupTypes={};
      let groupNames=[];

      groups.forEach( (c,x) =>{ 
        let curName = c.name.toLowerCase();
        groupNames.push( curName ); 
        groupTypes[ curName ]=x; 
      });

      groupNames.forEach( (curName) =>{
        if(curName.includes('camera')){
          let ch=groups[groupTypes[curName]].children;
          ch.forEach( (c,x)=>{
            c.matrixAutoUpdate=false;
            if(c.name.includes("position")){
              let toPos=c.position.clone();
              this.pxlCamera.cameraPrevPos=toPos.clone();
              this.pxlCamera.camera.position.copy(toPos);
              this.pxlCamera.cameraPos.copy(toPos);
              this.pxlCamera.camera.updateMatrixWorld();
              this.pxlCamera.cameraBooted=true;
              this.pxlEnv.camInitPos=toPos;
              this.pxlEnv.camThumbPos=this.pxlEnv.camThumbPos.clone().add( toPos.clone() );
            }else if(c.name.includes("lookat")){
              let toLookAt=c.position.clone();
              this.pxlCamera.cameraAimTarget.position.copy( toLookAt );
              this.pxlCamera.camera.lookAt(toLookAt);
              this.pxlCamera.camera.updateMatrixWorld();
              this.pxlCamera.cameraPrevLookAt=new Vector3();
              this.pxlEnv.camInitLookAt=toLookAt;
              this.pxlEnv.camThumbLookAt=this.pxlEnv.camThumbLookAt.clone().add( toLookAt.clone() );
            }else if(c.name.includes("returnposition")){
              let toPos=c.position.clone();
              this.pxlEnv.camReturnPos=toPos;
            }else if(c.name.includes("returnlookat")){
              let toPos=c.position.clone();
              this.pxlEnv.camReturnLookAt=toPos;
            }
          });
          this.pxlDevice.touchMouseData.initialQuat=this.pxlCamera.camera.quaternion.clone();
        }
        
        if(curName.includes('Items')){
          let ch=groups[groupTypes[curName]].children;
          let baseMtl=null;
          let lowGravMtl=null;
          let lizardKingMtl=null;
          let infinityZoomMtl=null;
          let starFieldMtl=null;
          while(ch.length>0){
            let g=ch.pop();
            //ch.push(...c.children);
            if(g.type == "Group"){
              let curChildren=g.children;
              curChildren.forEach( (c)=>{
                if(c.name.includes("Item")){
                  if( g.name.includes("LowGravity")){
                    if(lowGravMtl==null){
                      lowGravMtl=new ShaderMaterial({
                        uniforms:{
                          color:{value : c.material.emissive.clone() },
                          alphaMap:{type:'t',value : c.material.map },
                          cloudNoise:{type : 't',value : this.pxlEnv.cloud3dTexture},
                          time:{ value:this.pxlTimer.msRunner },
                          intensity: {  type:"f", value: 1.5 },
                          rate: { type:"f", value: this.pxlUser.itemRotateRate }
                        },
                        vertexShader:this.pxlShaders.objects.itemVert(),
                        fragmentShader:this.pxlShaders.objects.itemFrag(),
                        transparent:true,
                        side:DoubleSide,
                        depthTest:true,
                        depthWrite:false,
                      });
                    }
                    c.material=lowGravMtl;
                  }else if( g.name.includes("LizardKing") ){
                    if( lizardKingMtl==null ){
                      lizardKingMtl= c.material.clone();
                      lizardKingMtl.emissiveMap=lizardKingMtl.map;
                      lizardKingMtl.emissive=new Color( 0x808080 );
                    }
                    c.material=lizardKingMtl;
                  }else if( g.name.includes("StarField") ){
                    //c.material.emissiveMap=c.material.map;
                    //c.material.emissive=new Color( 0x808080 );
                  }else if( g.name.includes("InfinityZoom") ){
                    if(infinityZoomMtl==null){
                      infinityZoomMtl=new ShaderMaterial({
                        uniforms:{
                          color:{value : c.material.map },
                          cloudNoise:{type : 't',value : this.pxlEnv.cloud3dTexture},
                          time:{ value:this.pxlTimer.msRunner },
                          intensity: {  type:"f", value: 1.0 },
                          rate: { type:"f", value: this.pxlUser.itemRotateRate }
                        },
                        vertexShader:this.pxlShaders.core.defaultVert(),
                        fragmentShader:this.pxlShaders.objects.itemZoomFrag(),
                        transparent:true,
                        side:DoubleSide,
                        depthTest:true,
                        depthWrite:true,
                      });
                    }
                    c.material=infinityZoomMtl;
                  }
                  this.pxlUser.itemList[g.name]=c;
                }else if(c.name.includes("ItemBase")){
                  if(baseMtl==null){
                    baseMtl=new ShaderMaterial({
                      uniforms:{
                        color:{value : c.material.emissive.clone() },
                        alphaMap:{type:'t',value : c.material.map },
                        cloudNoise:{type : 't',value : this.pxlEnv.cloud3dTexture},
                        time:{ value:this.pxlTimer.msRunner },
                        intensity: {  type:"f", value: 1.5 },
                        rate: { type:"f", value: this.pxlUser.itemBaseRotateRate }
                      },
                      vertexShader:this.pxlShaders.objects.itemBaseVert(),
                      fragmentShader:this.pxlShaders.objects.itemBaseFrag(),
                      transparent:true,
                      side:DoubleSide,
                      depthTest:true,
                      depthWrite:false,
                    });
                  }
                  c.material=baseMtl;
                  this.pxlUser.itemBaseList.push(c);
                }
              });
              
              addToScene[0].add(g);
              this.pxlUser.itemGroupList[g.name]=g;
              this.pxlUser.itemListNames.push(g.name);
            }
          }
        }
      });
      
      if(meshKey!=''){
        this.pxlEnv.geoList[meshKey]=curFbx;
        this.pxlEnv.geoLoadList[meshKey]=1;
      }
      this.pxlEnv.geoLoadList[meshKey]=1;

    }, undefined, (err)=>{
      if(meshKey!=''){
        this.pxlEnv.geoLoadList[meshKey]=1;
      }
    });
    
    return fbxLoader;
  }

 // -- -- -- -- -- -- -- -- -- -- -- -- -- //
 // -- -- -- -- -- -- -- -- -- -- -- -- -- //
 // -- -- -- -- -- -- -- -- -- -- -- -- -- //
 
 
 // -- -- -- -- -- -- -- -- -- -- //
 // Environment FBX Loader        //
 // -- -- -- -- -- -- -- -- -- -- //

  loadRoomFBX( envObj, fbxPath = null, meshKey = null, enableLogging = false ){
    if( enableLogging ){
      this.runDebugger = true;
    }else{
      this.runDebugger = false;
    }
    if(meshKey==null){ // Prep for IsLoaded checks
        meshKey = envObj.getName();
    }
    if( !fbxPath ){
      fbxPath = envObj.sceneFile;
    }

    let objPath = envObj.sceneFile ;
    let materialList = envObj.materialList ;

    this.pxlEnv.geoLoadListComplete=0;
    this.pxlEnv.geoLoadList[meshKey]=0;

    let addedGlow=0;
    let envScene=envObj.scene;
    
    // TODO : Do new FBXLoader objects really need to be created?
    //          Sounds like the potential for a memory leak if not handled correctly
    var fbxLoader=new FBXLoader();
    fbxLoader.load( objPath, (curFbx)=>{
      //envScene.add(curFbx);
      let groups=curFbx.children;

      if( groups.length == 1 ){
        let curGroup = groups[0];
        let isMainScene = curGroup.name.toLowerCase().includes("scene");
        if( !isMainScene ){
          groups = curGroup.children;
          console.warn("-- pxlFile.loadRoomFBX() - Top level Environment Group not found --\n Attempting to use the first child group as FBX Scene\n Make sure your top group holds all sub-groups.");
        }
      }

      let groupTypes={};
      let groupNames=[];
      
      groups.forEach( (c,x)=>{
        let curName=c.name.split("_")[0].toLowerCase();
        groupNames.push(curName);
        groupTypes[curName]=x;
      });

      // Verbose Logging Step Count
      let count=0;
      /* - Used as -
        count++;
        this.log("Step Count - ",count);
      */
      
      // @ Loaded Scene File - Environment Group; 'camera'
      if(groupNames.indexOf('camera')>-1){
        let ch=[];
        this.log("Camera - ",groups[groupTypes['camera']]);
        
        let rootCamObjects = false;
        let checkGroups = groups[groupTypes['camera']].children;
        checkGroups.forEach( (c,x)=>{
          let curName = c.name.toLowerCase();
          if( curName.includes("position") || curName.includes("lookat") || curName.includes("returnposition") || curName.includes("returnlookat") ){
            ch.push(c);
            rootCamObjects=true;
          }else{
            if( c.children.length > 0 ){
              ch.push(...c.children);
            }
          }
        });

        //envObj.geoList['camera']=groups[groupTypes['camera']];
        ch.forEach( (c,x)=>{
          c.matrixAutoUpdate=false;
          let parentName = c.parent.name.toLowerCase();
          if( parentName == groups[groupTypes['camera']].name.toLowerCase() ){
            parentName = "default";
          }
          if( !envObj.camLocation.hasOwnProperty(parentName) ){
            envObj.camLocation[parentName]={};
            envObj.camLocation[parentName]["position"]=new Vector3( 0, 0, -10 );
            envObj.camLocation[parentName]["lookat"]=new Vector3( 0, 0, 0 );
          }
          let curName = c.name.toLowerCase();
          if(curName.includes("positionmobile")){
            let toPos=c.position.clone();
            envObj.cameraBooted=true;
            envObj.camInitPos=toPos;
            envObj.camLocation[parentName]["positionmobile"]=toPos;
          }else if(curName.includes("lookatmobile")){
            let toPos=c.position.clone();
            envObj.camInitLookAt=toPos;
            envObj.camLocation[parentName]["lookatmobile"]=toPos;
          }else if(curName.includes("position")){
            let toPos=c.position.clone();
            envObj.cameraBooted=true;
            envObj.camInitPos=toPos;
            envObj.camLocation[parentName]["position"]=toPos;
          }else if(curName.includes("lookat")){
            let toPos=c.position.clone();
            envObj.camInitLookAt=toPos;
            envObj.camLocation[parentName]["lookat"]=toPos;
          }else if(curName.includes("returnposition")){
            let toPos=c.position.clone();
            envObj.camReturnPos=toPos;
            envObj.camLocation[parentName]["returnposition"]=toPos;
          }else if(curName.includes("returnlookat")){
            let toPos=c.position.clone();
            envObj.camReturnLookAt=toPos;
            envObj.camLocation[parentName]["returnlookat"]=toPos;
          }
        });


        // Check for missing Mobile Camera Position/lookat
        let locationList = Object.keys( envObj.camLocation );
        locationList.forEach( (c)=>{
          let curLoc = envObj.camLocation[c];
          if( !curLoc.hasOwnProperty("positionmobile") ){
            curLoc["positionmobile"] = curLoc["position"];
          }
          if( !curLoc.hasOwnProperty("lookatmobile") ){
            curLoc["lookatmobile"] = curLoc["lookat"];
          }
        });

        //this.pxlDevice.touchMouseData.initialQuat=envObj.camera.quaternion.clone();
      }
      
      // @ Loaded Scene File - Environment Group; 'AutoCamPaths'
      if(groupNames.indexOf('AutoCamPaths')>-1){
        let ch=groups[groupTypes['AutoCamPaths']].children;
        this.log("AutoCamPaths - ",groups[groupTypes['AutoCamPaths']]);
        
        this.pxlAutoCam.autoCamPaths[ envObj.getName() ]=[];
        while(ch.length>0){
          let g=ch.pop();
          //ch.push(...c.children);
          if(g.type == "Group"){
            let autoPathDict={};
            let curChildren=g.children;
            curChildren.forEach( (c)=>{
              c.matrixAutoUpdate=false;
              autoPathDict[ c.name ] = c;
            });
            g.visible=false;
            g.matrixAutoUpdate=false;
            envScene.add(g);
            this.pxlAutoCam.autoCamPaths[ envObj.getName() ].push( autoPathDict );
          }
        }
      }

      // @ Loaded Scene File - Environment Group; 'Instances'
      if(groupNames.indexOf('instances')>-1 && this.pxlQuality.detailLimit == 0){
        let ch=[...groups[groupTypes['instances']].children];
        this.log("Instances - ",groups[groupTypes['instances']]);
        
        if( ch.length > 0 ){
          if( !envObj.hasOwnProperty("baseInstancesNames") ){
            envObj.baseInstancesNames = [];
          }
          if( !envObj.hasOwnProperty("baseInstancesList") ){
            envObj.baseInstancesList = {};
          }
          let chList = []
          ch.forEach( (c,x)=>{
            this.checkForUserData( envObj, envScene, c );

            if( materialList.hasOwnProperty( c.name ) ){
              let curMap = null;
              if( c.material.map ){
                curMap = c.material.map;
              }
              c.material= materialList[ c.name ];
              this.checkForMeshSettings( c, c.material );

              if( curMap ){
                if( c.material.uniforms.hasOwnProperty("diffuse") ){
                  c.material.uniforms.diffuse.value = curMap;
                }
                if( c.material.hasOwnProperty("emissiveMap") ){
                  c.material.emissiveMap=curMap;
                  if( c.material.emissive.r>0 ){
                    c.material.emissiveIntensity=c.material.emissive.r;
                  }
                }
              }
              c.matrixAutoUpdate=false;
            }else{
              if( c.material.map && !c.material.emissiveMap && c.material.color.r>0 ){
                let curMap = c.material.map;
                c.material.emissiveMap=curMap;
                c.material.emissiveIntensity=c.material.color.r*.4;
                c.material.emissive= c.material.color.clone();
                
              }
              
            }


            envObj.baseInstancesNames.push( c );
            envObj.baseInstancesList[c.name]=c;
          });
        }
      }
      
      
      // @ Loaded Scene File - Environment Group; 'Lights'
      if(groupNames.indexOf('lights')>-1){
        let ch=groups[groupTypes['lights']].children;
        this.log("Lights - ",groups[groupTypes['lights']]);
        
        while(ch.length>0){
          let c=ch.pop();
          ch.push(...c.children);
          
          if( c.type.includes("Light") ){
            if( !envObj.hasOwnProperty('lightList') ){
                envObj['lightList']={};
            }
            if( !envObj.geoList.hasOwnProperty('lights') ){
                envObj.geoList['lights']=[];
            }

            if( c.type == "PointLight" ){

              let lightTypeSplit = c.name.split("_");
              let lightType = lightTypeSplit[0];

              /*
              // Still working out the kinks for Spot Lights
              //
              if( lightType.toLowerCase() == "spot" ){
                try{
                // Spot Light --

                let spotLightShape = {
                  'color': 0xFFFFFF,
                  'intensity': 1,
                  'distance': 10,
                  'angle': Math.PI/3,
                  'penumbra': 0,
                  'decay': 2
                }
                let newLightData = Object.assign( {}, spotLightShape );
                let spotLight = new SpotLight( newLightData.color,
                    newLightData.intensity,
                    newLightData.distance, 
                    newLightData.angle, 
                    newLightData.penumbra, 
                    newLightData.decay
                  );
                spotLight.name = c.name;
                spotLight.userData = Object.assign( {}, c.userData );

                spotLight.rotation.set( c.rotation.x, c.rotation.y, c.rotation.z );
                spotLight.position.set( c.position.x, c.position.y, c.position.z );

                spotLight.matrixAutoUpdate=false;

                // -- -- --

                if( !envObj.lightList.hasOwnProperty( c.type ) ){
                  envObj.lightList[ c.type ] = [];
                }

                envObj.lightList[ c.type ].push( spotLight );
                envObj.geoList['lights'].push( spotLight );
                envScene.add( spotLight );

                c.parent.remove( c );

                }catch(e){
                  console.log(e);
                }
              }else{
              */
                // Point Light --

                c.decay = Math.max( 1.1, Math.min( 3.0, c.intensity ));
                //c.decay = 2;
                c.distance = c.distance == 0 ?  1000 * c.intensity : c.distance;
              //}
            }

            


            if( !envObj.lightList.hasOwnProperty( c.type ) ){
              envObj.lightList[ c.type ] = [];
            }
            
            envObj.lightList[ c.type ].push( c );
            envObj.geoList['lights'].push( c );
            
            c.matrixAutoUpdate=false;
            envScene.add( c );
          }
        }
      }
      

      // Merged Geo, faster but more polies
      // @ Loaded Scene File - Environment Group; 'MainScene'
      if(groupNames.includes('scene') || groupNames.includes('mainscene')){
        let groupId = groupTypes['scene'] || groupTypes['mainscene'];
        let ch = [...groups[groupId].children];
        this.log("MainScene - ",groups[groupId]);

        let curObjId = -1;
        while(ch.length>0){
          //curObjId++;
          
          /*if( curObjId >= ch.length ){
            break;
          }*/

          let c=ch.pop();
          
          this.log( "Cur Object - ", c.name );
          this.checkForUserData( envObj, envScene, c );

          if(c.isMesh){
            if( c.userData.hasOwnProperty("Show") && (!c.userData.Show || c.userData.Show == 0) ){
              c.visible = false;
            }
            
            c.layers.set( this.pxlEnums.RENDER_LAYER.SCENE );
            envObj.geoList[c.name]=c;
              
            let curSide = FrontSide;
            // @ FBX - User Data; boolean, 'doubleSided'
            if(c.userData.doubleSided){
              curSide=DoubleSide;
            }

            
            // Custom material shader was added to this object, apply it
            if( materialList.hasOwnProperty( c.name ) ){
              let curMap = null;
              if( c.material.map ){
                curMap = c.material.map;
              }
              c.material= materialList[ c.name ];

              this.checkForMeshSettings( c, c.material );

              if( curMap ){
                if( c.material.uniforms.hasOwnProperty("diffuse") ){
                  c.material.uniforms.diffuse.value = curMap;
                }
                if( c.material.hasOwnProperty("emissiveMap") ){
                  c.material.emissiveMap=curMap;
                  if( c.material.emissive.r>0 ){
                    c.material.emissiveIntensity=c.material.emissive.r;
                  }
                }
              }
              c.matrixAutoUpdate=false;
              //c.geometry.computeVertexNormals();
              //c.material.shading = SmoothShading;
            }else{
              let curMatList = c.material;
              if( !Array.isArray(c.material) ){
                curMatList = [ c.material ];
              }

              if( !this.checkIsGlassLiquid( envObj, envScene, c, curMatList ) ){
                curMatList.forEach( (m)=>{
                  if( m.map && !m.emissiveMap && m.emissive.r>0 ){
                    m.emissiveMap=m.map;
                    m.emissiveIntensity=m.emissive.r;
                    m.emissive=new Color( 0xFFFFFF );
                  }
                  m.side=curSide;
                  //m.depthWrite=true;
                  //m.depthTest=true;
                  //m.shading = SmoothShading;
                });
              }

              //c.geometry.computeVertexNormals();
              c.matrixAutoUpdate=false;
            }
           
              
          }else{ // Current Object isn't a mesh geometry
            if( c.type.includes("Light") ){
              if( !envObj.lightList.hasOwnProperty( c.type ) ){
                envObj.lightList[ c.type ] = [];
              }
              envObj.lightList[ c.type ].push( c );
            }else if( c.type == "Group" ){
              let addChildren = true;
              if( envObj.geoList.hasOwnProperty('Scripted') ){
                let scriptedList = Object.keys(envObj.geoList['Scripted']);
                //addChildren = false;
              }
              if( addChildren ){
                ch.push( ...c.children );
              }
            }
          }
        }
        envScene.add( ...groups[groupId].children );
      }
      
      
      // ## Restricted to only pxlNav's build
      // @ Loaded Scene File - Environment Group; 'Glass'
      if(groupNames.indexOf('glass')>-1){
        let ch=groups[groupTypes['glass']].children;
        this.log("Glass - ",groups[groupTypes['glass']]);
        
        if( ch.length > 0 ){
            if(!envObj.glassGroup){
                let glassGrp=new Group();
                envObj.glassGroup=glassGrp;
                envScene.add(glassGrp);
            }
            while(ch.length>0){
                let c=ch.pop();
                ch.push(...c.children);
                if(c.isMesh){
            
                    this.checkForUserData( envObj, envScene, c );
          
                    let cBackMat=c.material.clone();
                    c.material=cBackMat;
                    c.material.transparent=true;
                    c.material.opacity=.5;
                    c.material.shininess=20;
                    c.material.specular=c.material.color.clone();
                    c.material.specular.r = c.material.specular.r*.5 +.1;
                    c.material.specular.g = c.material.specular.g*.5 +.1;
                    c.material.specular.b = c.material.specular.b*.5 +.1;
                    
                    //c.material.side=FrontSide;
                    //c.material.depthTest=true;
                    c.material.side=BackSide;
                    c.material.depthWrite=false;
                    c.matrixAutoUpdate=false;
                    c.renderOrder = 1;
                    envObj.glassList.push(c);
                    envObj.glassGroup.add(c);
                    
                    let cFrontGeo = c.geometry.clone()
                    let cFrontMat= c.material.clone();
                    cFrontMat.copy( c.material );
                    let cFrontMesh = new Mesh( cFrontGeo, cFrontMat );
                    cFrontMesh.material.shininess=40;
                    cFrontMesh.material.side=FrontSide;
                    cFrontMesh.matrixAutoUpdate=false;
                    cFrontMesh.renderOrder = 2;
                    
                    
                    let curPos=c.position;
                    let curRot=c.rotation;
                    let curScale=c.scale;
                    
                    cFrontMesh.rotation.set(curRot.x,curRot.y,curRot.z);
                    cFrontMesh.position.set(curPos.x,curPos.y,curPos.z);
                    cFrontMesh.scale.set(curScale.x,curScale.y,curScale.z);
                    cFrontMesh.updateMatrix();
                    
                    envScene.add( cFrontMesh )
                    envObj.glassList.push(cFrontMesh);
                    envObj.glassGroup.add(cFrontMesh);
                }
            }
        }
      }
      

      // @ Loaded Scene File - Environment Group; 'Colliders'
      if(groupNames.indexOf('colliders')>-1){
        let colliderParent=groups[groupTypes['colliders']];
        this.log("Colliders - ",groups[groupTypes['colliders']]);
        
        let colliderGroups=colliderParent.children;
        envObj.collidersExist=colliderGroups.length>0;

        for(let x=0; x<colliderGroups.length; ++x){
          let pName=colliderGroups[x].name.toLowerCase();

          let curChildren=colliderGroups[x].children;
          while(curChildren.length>0){
            let child=curChildren.pop();
            curChildren.push(...child.children);
            if(child.isMesh){
              child.visible=false;

              if( pName == "colliderwalls"){ // Movement limiting walls
                envObj.antiColliderActive=true;
                envObj.antiColliderList.push( child );

              // TODO : ColliderTops are implemented in `Ground` colliders to a degree.
              //          Full removal of the `ColliderTops` collider group is pending
              }else if( pName == "collidertops"){ // Top surface of wall, standable top
                envObj.antiColliderTopActive=true;
                envObj.antiColliderTopList.push( child );

              }else{ // `Ground`, `RoomWarp`, & All Other Colliders

                if( pName == "roomwarpzone"){
                  envObj.hasRoomWarp=true;
                  envObj.roomWarp.push(child);
                }

                envObj.colliderActive=true;
                envObj.colliderList.push( child );
              }

              child.matrixAutoUpdate=false;
              envScene.add(child);
              envObj.geoList[child.name]=child;
            }
          }
        }

        // -- -- --

        // Parse grid Vertex-Faces for collision detection
        //   Prep barycentric coordinate dependency values
        //     Vert-Edge lengths, Edge Dot Products, Vert-Face areas & data
        if( envObj.hasColliderType( this.pxlEnums.COLLIDER_TYPE.FLOOR ) ){
          this.pxlColliders.prepColliders( envObj, this.pxlEnums.COLLIDER_TYPE.FLOOR );
        }else if( envObj.hasColliderType( this.pxlEnums.COLLIDER_TYPE.WALL ) ){
          this.pxlColliders.prepColliders( envObj, this.pxlEnums.COLLIDER_TYPE.WALL );
        }else if( envObj.hasColliderType( this.pxlEnums.COLLIDER_TYPE.WALL_TOP ) ){
          this.pxlColliders.prepColliders( envObj, this.pxlEnums.COLLIDER_TYPE.WALL_TOP );
        }else if( envObj.hasColliderType( this.pxlEnums.COLLIDER_TYPE.ROOM ) ){
          this.pxlColliders.prepColliders( envObj, this.pxlEnums.COLLIDER_TYPE.ROOM );
        }
      }
      
      
      // @ Loaded Scene File - Environment Group; 'PortalExit'
      if(groupNames.indexOf('portalexit')>-1){
        let ch=groups[groupTypes['portalexit']].children;
        this.log("PortalExit - ",groups[groupTypes['portalexit']]);
        
        while(ch.length>0){
          let c=ch.pop();
          c.matrixAutoUpdate=false;
          envObj.hasPortalExit=true;
          envObj.portalList[c.name]=c;
        }
      }  
      
      // @ Loaded Scene File - Environment Group; 'FlatColor'
      if(groupNames.indexOf('flatcolor')>-1){
        let ch=groups[groupTypes['flatcolor']].children;
        this.log("FlatColor - ",groups[groupTypes['flatcolor']]);
        
        while(ch.length>0){
          let c=ch.pop();
          ch.push(...c.children);
          if(c.isMesh){
            
            this.checkForUserData( envObj, envScene, c );
          
            let mtl=new MeshBasicMaterial({
              color:c.material.color.clone()
            });
            //mtl.side=DoubleSide;  
            mtl.side=FrontSide;
            mtl.flatShading=true;
            c.material=mtl;
            c.layers.set( this.pxlEnums.RENDER_LAYER.SCENE );
            c.matrixAutoUpdate=false;
            envScene.add(c);
            //addToScene[1].add(c.clone());
          }
        }
      }
      
      
      


      // @ Loaded Scene File - Environment Group; 'LambertColor'
      if(groupNames.indexOf('lambertcolor')>-1){
        let ch=groups[groupTypes['lambertcolor']].children;
        this.log("LambertColor - ",groups[groupTypes['lambertcolor']]);
        
        while(ch.length>0){
          let c=ch.pop();
          ch.push(...c.children);
          if(c.isMesh){
            
            this.checkForUserData( envObj, envScene, c );
          
            let mtl=new MeshLambertMaterial();
            if(c.material.map){
              let mtlMap=c.material.map.clone();
              mtl.map=mtlMap;
              //mtl.color=new Color( 0x888888 );
              mtl.emissiveMap=mtlMap;
              mtl.emissiveIntensity=.5;
              c.material=mtl;
            }else{
              mtl.color=c.material.color.clone();
              mtl.emissive=c.material.emissive.clone();
              //mtl.side=DoubleSide;
              mtl.side=FrontSide;
              mtl.flatShading=true;
              c.material=mtl;
            }
            
            c.layers.set( this.pxlEnums.RENDER_LAYER.SCENE );
            c.matrixAutoUpdate=false;
            envScene.add(c);
            //addToScene[1].add(c.clone());
          }
        }
      }
       
            
      // @ Loaded Scene File - Environment Group; 'Sky'
      if(groupNames.indexOf('sky')>-1){
        let ch=groups[groupTypes['sky']].children;
        this.log("Sky - ",groups[groupTypes['sky']]);
        
        while(ch.length>0){
          let c=ch.pop();
          ch.push(...c.children);
          if(c.isMesh){
            let curMat = null;
            if( materialList.hasOwnProperty( c.name ) ){
              curMat = materialList[ c.name ];
              this.checkForMeshSettings( c, curMat );
            }else{
              curMat=new ShaderMaterial({
                uniforms:{
                  diffuse: { type:"t",value:c.material.map },
                  noiseTexture: { type:"t",value:null },
                  fogColor:{ value: envScene.fog.color },
                  time:{ value:this.pxlTimer.msRunner },
                  camNear:{ type:"f", value: envObj.camera.near },
                  camFar:{ type:"f", value: envObj.camera.far*.85 },
                  resUV: { value: this.pxlDevice.screenRes },
                },
                vertexShader:this.pxlShaders.scene.skyObjectVert(),
                fragmentShader:this.pxlShaders.scene.skyObjectFrag( this.pxlOptions.skyHaze )
              });
            }
            //c.geometry.computeVertexNormals();
            c.material = curMat;
            c.matrixAutoUpdate = false;
            c.frustumCulled = false;
            c.layers.set( this.pxlEnums.RENDER_LAYER.SKY )
            c.material.depthTest=true;
            c.material.depthWrite=false;

            if( c.material?.uniforms.hasOwnProperty("noiseTexture") && envObj?.cloud3dTexture ){
              c.material.uniforms.noiseTexture.value = envObj.cloud3dTexture;
            }

            // Currently unused as the vapor sky object shader no longer has horizon detection
            //   It's a desired effect as an option, but not currently implemented internally
            // Accessible via the `pxlRoom.materialList` object
            //   Simply add a texture uniform of `depthTexture` to your custom shader
            // TODO : Expand this to allow for depthMap derived fog / env effects in the sky
            if( c.material?.uniforms.hasOwnProperty("depthTexture") && envScene?.renderTarget?.depthTexture ){
              c.material.uniforms.envDiffuse.value = envScene.renderTarget.depthTexture;
            }

            envObj.geoList[ c.name ] = c;
            envObj.materialList[ c.name ] = curMat;
            //envObj.shaderGeoList[c.name]=c;
            envScene.add(c);
          }
        }
      }
       

      // Shader Overrides
      // @ Loaded Scene File - Environment Group; 'AnimatedTextures'
      if(groupNames.indexOf('animatedtextures')>-1){
        let ch=groups[groupTypes['animatedtextures']].children;
        this.log("AnimatedTextures - ",groups[groupTypes['animatedtextures']]);
        
        while(ch.length>0){
          let c=ch.pop();
          ch.push(...c.children);
          if(c.isMesh){
            
            this.checkForUserData( envObj, envScene, c );
          
            let uValues={
                time:{ value:this.pxlTimer.msRunner },
                glowTexture: { type:"t",value:c.material.map },
                cloudNoise:{type : 't',value : this.pxlEnv.cloud3dTexture},
                glowColor: { value: new Vector3( .01,.35,.55 ) },
                intensity: { type:"f", value: .35 },
                rate: { type:"f", value: 2.0 },
                freq: { type:"f", value: 1.0 }
              };
            let vertShader=this.pxlShaders.animated.animTextureVert();
            let fragShader=this.pxlShaders.animated.animTextureFrag();
            
            let curMat=new ShaderMaterial({
              uniforms:uValues,
              vertexShader:vertShader,
              fragmentShader:fragShader,
              transparent:true,
              //depthTest:true,
              //depthWrite:true,
              //side:DoubleSide
              side:FrontSide
            });
            
            //c.geometry.computeVertexNormals();

            c.material=curMat;
            
            c.matrixAutoUpdate=false;
            envScene.add(c);
          }
        }
      }
      
      
      // @ Loaded Scene File - Environment Group; 'ScrollingTextures'
      if(groupNames.indexOf('scrollingtextures')>-1){
        let ch=groups[groupTypes['scrollingtextures']].children;
        this.log("ScrollingTextures - ",groups[groupTypes['scrollingtextures']]);
        
        let scrollScreenSeed=1;
        while(ch.length>0){
          scrollScreenSeed+=1;
          let c=ch.pop();
          ch.push(...c.children);
          if(c.isMesh){
            
            this.checkForUserData( envObj, envScene, c );
          
            let name=c.name;
            let speed=0.05;
            if(name.indexOf("_")>-1){
              speed=name.split("_")[1];
              speed=parseInt(speed)*.01;
            }
            let curMat=new ShaderMaterial({
              uniforms:{
                scrollTexture:{type : 't',value:c.material.map},
                //cloudNoise:{type : 't',value : this.cloud3dTexture},
                time:{ value:this.pxlTimer.msRunner },
                speed: { value: speed },
                seed:{ type:'f',value:scrollScreenSeed*1.1423 },
                boostPerc: { value: 1.0 },
              },
              vertexShader:this.pxlShaders.animated.scrollingTextureVert(),
              fragmentShader:this.pxlShaders.animated.scrollingTextureFrag(),
              transparent:true,
              //side:DoubleSide,
              side:FrontSide,
              //depthTest:true,
              //depthWrite:true
            });
            
            //c.geometry.computeVertexNormals();
            c.material=curMat;
            
            c.matrixAutoUpdate=false;
            envScene.add(c);
          }
        }
      }
      
      
      
      // @ Loaded Scene File - Environment Group; 'UserScreens'
      // TODO : Update to read mask from material
      //          Less magic number reliance
      if(groupNames.indexOf('userscreens')>-1){
        let ch=groups[groupTypes['userscreens']].children;
        this.log("UserScreens - ",groups[groupTypes['userscreens']]);
        
        let userScreenSeed=0;
        // Run the mask layers outside shader calculations
        let maskArray=[ new Vector3(1,0,0), new Vector3(0,1,0), new Vector3(0,0,1) ]
        // Non-included masks
        // TODO : Add method to pass materials through to UserScreens from textureList{}
        let maskPaths=[this.assetRoot+"DJ_Vector_Masks_1.jpg", this.assetRoot+"DJ_Vector_Masks_2.jpg", this.assetRoot+"DJ_Vector_Masks_3.jpg"];
        let modMaskId=0;
        let modPathId=0;
        let modMax=maskArray.length;
        while(ch.length>0){
          let c=ch.pop();
          ch.push(...c.children);
          if(c.isMesh){
            let curMat=new ShaderMaterial({
              uniforms:{
                camExists:{ type:'f',value:0.0 },
                time:{ value:this.pxlTimer.msRunner },
                seed:{ type:'f',value:userScreenSeed*1.1423 },
                alpha:{ type:'f',value:1.0 },
                boostPerc: { value: envObj.userScreenIntensity },
                scale:{ value:new Vector2(100,100)},
                ratio:{ value:new Vector2(1,1)},
                videoFeed:{type : 't',value:null},
                cloudNoise:{type : 't',value : this.pxlEnv.cloud3dTexture},
                maskChannel:{value : maskArray[modMaskId] },
                maskMap:{type : 't',value : this.pxlUtils.loadTexture( maskPaths[modPathId] ) },
              },
              vertexShader:envObj.userScreenVert,
              fragmentShader:envObj.userScreenFrag,
              transparent:true,
              //side:DoubleSide,
              side:FrontSide,
              //depthTest:true,
              //depthWrite:true
            });
                        
            //c.geometry.computeVertexNormals();
            c.material=curMat;
            
            c.matrixAutoUpdate=false;
            envObj.pxlEnv.camScreenData.screenGeoList.push(c)
            
            envScene.add(c);
                        
            userScreenSeed += 1;
            modMaskId = userScreenSeed % modMax;
            modPathId = Math.floor(userScreenSeed/3) % modMax;
          }
        }
      }
      
      
      // @ Loaded Scene File - Environment Group; 'Items'
      if(groupNames.indexOf('items')>-1){
        let ch=groups[groupTypes['items']].children;
        this.log("Items - ",groups[groupTypes['items']]);
        
        while(ch.length>0){
          let g=ch.pop();
          //ch.push(...c.children);
          // ## Set up Environment Assets for Item List
          if(g.type == "Group"){
            let curChildren=g.children;
            if( curChildren.length > 0 ){
              curChildren.forEach( (c)=>{
                if(c.name.includes("Item")){
                  let curMat=new ShaderMaterial({
                      uniforms:{
                          color:{value : c.material.emissive.clone() },
                          alphaMap:{type:'t',value : c.material.map },
                          cloudNoise:{type : 't',value : this.cloud3dTexture},
                          time:{ value:this.pxlTimer.msRunner },
                          intensity: {  type:"f", value: 1.5 },
                          rate: { type:"f", value: this.pxlUser.itemRotateRate }
                      },
                      vertexShader:this.pxlShaders.objects.itemVert(),
                      fragmentShader:this.pxlShaders.objects.itemFrag(),
                      transparent:true,
                      side:DoubleSide,
                      depthTest:true,
                      depthWrite:false,
                  });
                  c.material=curMat;
                  this.pxlUser.itemList[g.name]=c;
                }else if(c.name.toLowerCase().includes("base")){
                  let curMat=new ShaderMaterial({
                      uniforms:{
                          color:{value : c.material.emissive.clone() },
                          alphaMap:{type:'t',value : c.material.map },
                          cloudNoise:{type : 't',value : this.cloud3dTexture},
                          time:{ value:this.pxlTimer.msRunner },
                          intensity: {  type:"f", value: 1.5 },
                          rate: { type:"f", value: this.pxlUser.itemBaseRotateRate }
                      },
                      vertexShader:this.pxlShaders.objects.itemBaseVert(),
                      fragmentShader:this.pxlShaders.objects.itemBaseFrag(),
                      transparent:true,
                      side:DoubleSide,
                      depthTest:true,
                      depthWrite:false,
                  });
                  c.material=curMat;
                  this.pxlUser.itemBaseList.push(c);
                }
              });
              
              envScene.add(g);
              this.pxlUser.itemGroupList[g.name]=g;
              this.pxlUser.itemListNames.push(g.name);
            }
          }
        }
      }
      
      
      // @ Loaded Scene File - Environment Group; 'Scripted'
      if(groupNames.includes('scripted')){
        let ch=groups[groupTypes['scripted']].children;
        this.log("Scripted - ",groups[groupTypes['scripted']]);
        
        while(ch.length>0){
          let c=ch.pop();
          if(c.isMesh){
              envObj.geoList[c.name]=c;
              envScene.add(c);
          }
        }
      }
      

      // @ Loaded Scene File - Environment Group; 'Clickable'
      if(groupNames.includes('clickable')){
        let colliderParent=groups[groupTypes['clickable']];
        this.log("Clickable - ",groups[groupTypes['clickable']]);
        
        let colliderGroups=colliderParent.children;
        for(let x=0; x<colliderGroups.length; ++x){
          let pName=colliderGroups[x].name;
          let curChildren=colliderGroups[x].children;
          while(curChildren.length>0){
            let child=curChildren.pop();
            curChildren.push(...child.children);
            if(child.isMesh){
              let mtl=new MeshBasicMaterial();
              mtl.color=new Color( 0xffffff );
              //mtl.map=child.material.map.clone()
              child.material.emissive=new Color( 0x444444 );
              child.material.emissiveMap=child.material.map;
            
              child.matrixAutoUpdate=false;
            
              if(!envObj.objectClickableObjectList[child.name]){
                envObj.objectClickableObjectList[child.name]={};
              }
              envObj.objectClickableObjectList[child.name][pName]=child;
              envObj.objectClickable.push(child);
              envScene.add(child);
              
              if(pName=="Hover"){
                child.visible=false;
              }
            }
          }
        }
      }
      
      // @ Loaded Scene File - Environment Group; 'Markers'
      if(groupNames.includes('markers')){
        let ch=groups[groupTypes['markers']].children;
        this.log("Markers - ",groups[groupTypes['markers']]);
        
        while(ch.length>0){
          let c=ch.pop();
          envObj.marker[ c.name ]=c.position;
        }
      }

      this.pxlEnv.geoList[meshKey]=curFbx;
      this.pxlEnv.geoLoadList[meshKey]=1;

      envObj.fbxPostLoad();
      
      this.runDebugger = false;
    }, null, (err)=>{
      if(meshKey!=''){
        this.pxlEnv.geoLoadList[meshKey]=1;
      }
      this.log("Error Loading FBX");
      this.log(err);
      
      this.runDebugger = false;
    });
    
    return fbxLoader;
  }


  loadAnimFBX( envObj, meshKey, rigPath, animPath, stateConnections ){
    if(meshKey==''){ // Prep for IsLoaded checks
        meshKey = envObj.getName();
    }
    this.pxlEnv.geoLoadListComplete=0;
    this.pxlEnv.geoLoadList[meshKey]=0;

    let addedGlow=0;
    let envScene=envObj.scene;
    // TODO : Do new FBXLoader objects really need to be created?
    //          Sounds like the potential for a memory leak if not handled correctly
    var fbxLoader=new FBXLoader();
    fbxLoader.load( rigPath, (curFbx)=>{

      let groups=curFbx.children;
      let groupTypes={};
      let groupNames=[];
      
      groups.forEach((c,x)=>{ let curName=c.name.split("_")[0]; groupNames.push(curName); groupTypes[curName]=x; });

      curFbx.traverse((c)=>{
        this.checkForUserData( envObj, envScene, c );

        if(c.userData.hasOwnProperty("doubleSided") && c.userData.doubleSided){
          c.material.side=DoubleSide;
        }
        //if(c.material?.map){
          //console.log(c.material.map);
          //c.material.emissiveMap=c.material.map;
          //c.material.emissiveIntensity=c.material.emissive.r;
          //c.material.emissive=new Color( 0xFFFFFF );
          //c.material.map.colorSpace = NoColorSpace;
          //c.material.map.colorSpace = LinearSRGBColorSpace;
          //c.material.map.colorSpace = SRGBColorSpace;
        //}
      });

      this.pxlAnim.initObject( meshKey, curFbx );

      // -- -- --
      
      this.log("Animation FBX - ",groupNames[0]);
      envScene.add(curFbx);
      curFbx.frustumCulled = false;

      var animLoader = new FBXLoader();
      let promisList = [];
      let animKeys = Object.keys( animPath );
      animKeys.forEach( (animKey)=>{
        let curAnimPath = animPath[animKey];
        let animPromise = new Promise((resolve, reject) => {
          animLoader.load( curAnimPath, (animFbx)=>{
            if( animFbx.animations.length == 0 ){
              this.log("No animations found in file", curAnimPath);
              this.log(animFbx);
              resolve();
            }
            this.pxlAnim.addClips( meshKey, animKey, animFbx );
            this.log("Animation Loaded", animKey);
            resolve();
          }, null, (err)=>{
            this.log("Animation Load Error");
            this.log(err);
            reject(err);
          });
        });
        promisList.push( animPromise );
      });

      Promise.all(promisList).then(() => {
        this.pxlAnim.setStateConnections( meshKey, stateConnections );
        //this.pxlEnv.geoList[meshKey]=curFbx;
        envObj.geoList[meshKey]=curFbx;
        this.pxlEnv.geoLoadList[meshKey]=1;
        envObj.animPostLoad(meshKey);
      }).catch((err) => {
        this.log("Error loading animations", err);
      });

      // -- -- --
      /*
      //envObj.geoList[c.name]=c;
      let count=0;
    
      let runner = -1;
      while(runner < groups.length-1){
        runner++;
        let c=groups[runner];
        if(!c){
          this.log("-- Error, Uncaught Animation Child --");
          this.log("Error Entry- '"+runner+"'");
        }
        
        this.checkForUserData( envObj, envScene, c );
        if(c.isMesh){
          if( c.userData.hasOwnProperty("Show") && (!c.userData.Show || c.userData.Show == 0) ){
            c.visible = false;
          }
          
          envObj.geoList[c.name]=c;
            
          let curSide = FrontSide;
          
          if(c.userData.doubleSided){
            curSide=DoubleSide;
          }
          
          if( materialList.hasOwnProperty( c.name ) ){
            c.material= materialList[ c.name ];
            this.checkForMeshSettings( c, c.material );
            c.matrixAutoUpdate=false;
            continue;
          }
          
          if( c.material.map ){
            c.material.emissiveMap=c.material.map;
            if( c.material.emissive.r>0 ){
              c.material.emissiveIntensity=c.material.emissive.r;
            }
            c.material.emissive=new Color( 0xFFFFFF );
            
            if( !c.material.specularMap && c.material.specular.r>0 ){
              c.material.specularMap=c.material.map;
            }
          }else{
            c.material.emissive = c.material.color;
          }
          //c.material.depthWrite=true;
          c.material.side=curSide;
          //c.geometry.computeVertexNormals();
          //c.matrixAutoUpdate=false;
          c.frustumCulled = false;
          c.matrixAutoUpdate=true;
          //envScene.add(c);
            
        }else if( c.type == "Group" ){
          groups.push( ...c.children );
          c.frustumCulled = false;
        }else if(  c.type == "Bone" ){
          
          c.frustumCulled = false;
          groups.push( ...c.children );
        }else{
          this.log("-- Warning, FBX Animation Bypass --");
          this.log("Bypass Name- '"+c.name+"';\nBypass Type- '"+c.type+"'");
        }
      }

      console.log("animLoaded");
      envObj.animPostLoad(meshKey);
      */
    }, null, (err)=>{
      if(meshKey!=''){
        this.pxlEnv.geoLoadList[meshKey]=1;
      }
    });
    

    return fbxLoader;
  }


// -- -- -- -- --


  pxlShaderBuilder( customUniforms, vertShader, fragShader, defines=null ){
    var mat;
    var uniforms={
      diffuse:{type:"t",value:null},
      time:{ value:this.pxlTimer.msRunner }
    };
    if(customUniforms!=null){
      uniforms=Object.assign({},uniforms,customUniforms);
    }
    
    let shaderOptions={
      uniforms:uniforms,
      vertexShader:vertShader,
      fragmentShader:fragShader
    }
    if( defines ){
      shaderOptions.defines = defines;
    }
    
    mat=new ShaderMaterial( shaderOptions );
    mat.transparent=true;
    mat.depthTest=true;
    
    return mat;
  }


  ////////////////////////////////////////////////////

  removeChildren(curObj){
    var removedCount=0;
    var children=curObj.children;
    for(var x=0; x<children.length; ++x){
      if(children[x].type == "Group"){
        curObj.remove(children[x]);
        removedCount++;
      }
    }
    return removedCount;
  }

  findMesh(curObj){
    var ret=null;
    var children=curObj.children;
    for(var x=0; x<children.length; ++x){
      if(children[x].type == "Mesh"){
        ret=children[x];
        break;
      }
    }
    return ret;
  }

  // Used mainly for groups of objects rather than calculating bbox for an object itself
  getBBoxCentroid(curObj){
    try{
      var objBBox=new Box3().setFromObject(curObj);
      var min=objBBox.min;
      var max=objBBox.max;
      var objCentroid=new Vector3().addVectors(max,min).multiplyScalar(.5);
      curObj.userData={'bbox':objBBox, 'centroid':objCentroid};
      if(mapBookHelper != null){
        mapBookHelper.update();
      }
    }catch(err){
      if(this.verbose >= VERBOSE_LEVEL.ERROR){
        console.log("- - - - - - - - ERROR - - - - - - - -");
        console.log("     Object does not exist.\n           - Error Info -");
        console.log(err);
        console.log("- - - - - - - - - - - - - - - - - - -");
      }
    }
  }
  
  
    loadScript( url ){
        return new Promise( (resolve, reject)=>{
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = true;

            script.onreadystatechange = ()=>{ resolve(true); } ;
            script.onload = ()=>{ resolve(true); } ;

            document.head.appendChild(script);
        });
    }
    
    
    xmlHttp(){
        return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    }
    
  // ## Added for Google Drive doc reading
  //      Links open within the iframe and fail on header source origin issues
  static getURLContent(url){
    return new Promise( (resolve, reject)=>{
            //let xhrRequest= this.xmlHttp();
            let xhrRequest= window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
      /*xhrRequest.onreadystatechange=(e)=>{
        if(xhrRequest.readyState==4 && xhrRequest.status==200){
          return xhrRequest.responceText;
        }
      };*/
      xhrRequest.open("GET",url);//,false);
      xhrRequest.onload=(e)=>{
        if(xhrRequest.readyState==4 && ( xhrRequest.status>=200 && xhrRequest.status<300 ) ){
          resolve(xhrRequest.response);
        }else{
          resolve(xhrRequest.statusText);
        }
      }
      xhrRequest.onerror=()=>reject(xhrRequest.statusText);
      xhrRequest.send();
    });
  }

  getExternalHTML(url, callback){
    if(!window.XMLHttpRequest){
      window.open( url, '_blank' );
      return;
    }
        let xhrRequest= this.xmlHttp();
    xhrRequest.onreadystatechange=function(){
      if (this.readyState == 4 && this.status == 200) {
        if( callback && typeof( callback ) === 'function' ){
          callback( xhrRequest.responseText );
        }
      }
    }
    xhrRequest.open( 'GET', url, true );
    xhrRequest.responceType='document';
    xhrRequest.send();
  }

  fetchURLStatus(url, cmdRun, resolveDict){
        fetch( url, {
            method: 'HEAD'
        }).then( (resolve) =>{
            cmdRun(resolve.status, resolveDict);
        }).catch( (err)=>{
            cmdRun(404, resolveDict);
        });
  }
    
    
    urlExistsFallback( url ){
        return new Promise( (resolve, reject)=>{
            let xhrRequest= this.xmlHttp();

            xhrRequest.open('HEAD', url, true);
            xhrRequest.send();

            xhrRequest.onreadystatechange=function(){
                if( this.readyState == this.DONE ){
                    resolve( this.status<400 );
                }
            }
            xhrRequest.onerror=(err)=>{
                resolve( false );
            };
            xhrRequest.ontimeout=(err)=>{
                resolve( false );
            };
        });
    }
    
    // Extend browser to handle url requests ( Unused )
    //   While the network layer has been removed,
    //     The primary source of excessive API & server requests,
    //       Retaining the code for future web worker management
    urlExists(url){
        var worker;
        if( false && Worker ){
            worker = new Worker("js/pxlBase/webWorkers/FileWorkerIO.js");  
            //this.workerList.push( worker );
        }
        
        return new Promise( (resolve, reject)=>{
            if( worker ){
                worker.onmessage = function(event) {  
                    resolve( event.data.data );
                };
                worker.onerror = function(event) {  
                    resolve( false );
                };

                worker.postMessage( { type: "urlExists", data: url } );
            }else{
                let resp= this.urlExistsFallback( url ).then( (resp)=>{
                    resolve( resp );
                });
            }
        }).then( (resp)=>{
            if( worker ){
                worker.terminate();
            }
            return resp;
        }).catch( (err)=>{
            if( worker ){
                worker.terminate();
            }
            return false;
        });
    }
}