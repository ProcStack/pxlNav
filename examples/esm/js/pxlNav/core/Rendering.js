// pxlNav Rendering Core
//   Written by Kevin Edzenga; 2020,2024,2025
//
// Rendering core functions and management
//   Handles render buffers and render loop


import {
  Vector2,
  ShaderMaterial,
  FrontSide,
  LinearSRGBColorSpace
} from "three";

import { EffectComposer, RenderPass, ShaderPass, CopyShader, UnrealBloomPass } from '../../libs/three/index.js';

import { ANTI_ALIASING } from "./Enums.js";

/**
 * @namespace pxlRendering
 * @description pxlNav Rendering
 */
export class Rendering{
  constructor( pxlOptions ){
    this.pxlOptions = pxlOptions;
    this.pxlEnv = null;
    this.pxlUser = null;
    this.pxlUtils = null;
    this.pxlTimer = null;
    this.pxlQuality = null;
    this.pxlDevice = null;
    this.pxlCamera = null;
    this.pxlShaders = null;

    // Engine boots in `pxlNav.js` and is passed here
    //   It probably should boot here, but been refactoring for a while now
    //     It'll end up in this file eventually
    this.engine = null;
    this.scene = null;
    this.shaderPasses={};
    this.stepShaderFuncArr=[];
    
    this.pxlRenderSettings={
      'exposure':1.0,
      'mult':1.0,
      'bloomStrength':0.5,
      'bloomThresh':.6,
      'bloomRadius':.05,
    }

    // ## Move passes to a dict
    this.mapMotionBlurPass=null;
    this.mapOverlayHeavyPass=null;
    this.mapOverlayPass=null;
    this.mapOverlaySlimPass=null;
    this.mapBoxAAPass=null;
    this.mapCrossAAPass=null;
    this.mapWorldPosMaterial=null;
    this.mapGlowPass=null;
    this.mapComposer=null;
    this.mapComposerMotionBlur=null;
    this.mapComposerGlow=null;
    this.chromaticAberrationPass=null;
    this.lizardKingPass=null;
    this.mapComposerWarpPass=null;
    this.blurScreenMerge=null;
  }
  init(){
  }
  setDependencies( pxlNav ){
    this.scene=pxlNav.scene;
    this.pxlEnv = pxlNav.pxlEnv;
    this.pxlUser = pxlNav.pxlUser;
    this.pxlUtils = pxlNav.pxlUtils;
    this.pxlTimer = pxlNav.pxlTimer;
    this.pxlQuality = pxlNav.pxlQuality;
    this.pxlDevice = pxlNav.pxlDevice;
    this.pxlCamera = pxlNav.pxlCamera;
    this.pxlShaders = pxlNav.pxlShaders;
  }


  // Build composers and passes
  /**
   * @memberof pxlRendering
   * @function buildComposers
   * @description Build EffectComposers and ShaderPasses
   */
  buildComposers(){
        
        // Set up swapable frame buffers, for prior frame reads
        /*EffectComposer.prototype.swapBuffer = ()=>{
            let tmpBuffer = this.renderTarget2;
            this.renderTarget2 = this.renderTarget1;
            this.renderTarget1 = tmpBuffer;
        };*/
        
    ///////////////////////////////////////////////////
    // -- SCENE WIDE MATERIALS  -- -- -- -- -- -- -- //
    ///////////////////////////////////////////////////

    let near = this.pxlCamera.camera?.near || 0.1;
    let far = this.pxlCamera.camera?.far || 1000;
    this.mapWorldPosMaterial=new ShaderMaterial({
      uniforms:{
        camNear: { type:"f", value: near },
        camFar: { type:"f", value: far }
      },
      vertexShader: this.pxlShaders.rendering.worldPositionVert(),
      fragmentShader: this.pxlShaders.rendering.worldPositionFrag()
    });
    //this.mapWorldPosMaterial.side=DoubleSide;
    this.mapWorldPosMaterial.side=FrontSide;
    this.mapWorldPosMaterial.name="mapWorldPosMaterial";
      
    ///////////////////////////////////////////////////
    // -- 2-Step Blur Composer  -- -- -- -- -- -- -- //
    ///////////////////////////////////////////////////

    this.blurComposer = new EffectComposer(this.engine);
    
    this.shaderPasses.blurXShaderPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.pxlTimer.msRunner },
          tDiffuse: { value: null },
          pDiffuse: { value: null },
          resUV: { value: this.pxlDevice.screenRes },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.directionalBlurPass( "pDiffuse", [1,0], 4, 1.8 ),
        defines: {}
      } ), "tDiffuse"
    );

    this.shaderPasses.blurXShaderPass.material.uniforms.pDiffuse = this.pxlEnv.scene.renderGlowTarget.texture;
    this.shaderPasses.blurXShaderPass.material.transparent = true;
    this.shaderPasses.blurXShaderPass.needsSwap = true;
    this.shaderPasses.blurXShaderPass.enabled=false;
    this.shaderPasses.blurXShaderPass.name="blurXShaderPass";
    this.blurComposer.addPass( this.shaderPasses.blurXShaderPass );
    
    
    this.shaderPasses.dirBlurCopyPass = new ShaderPass(CopyShader);
    this.shaderPasses.dirBlurCopyPass.enabled=false;
    this.shaderPasses.dirBlurCopyPass.name="dirBlurCopyPass";
    this.blurComposer.addPass(this.shaderPasses.dirBlurCopyPass);
    
    this.shaderPasses.blurYShaderPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.pxlTimer.msRunner },
          tDiffuse: { value: null },
          //pDiffuse: { value: this.pxlEnv.scene.renderGlowTarget.texture },
          //pDiffuse: { value: this.blurComposer.writeBuffer.texture },
          pDiffuse: { value: null },
          resUV: { value: this.pxlDevice.screenRes },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.directionalBlurPass( "pDiffuse", [0,1], 4, 1.3 ),
        defines: {}
      } ), "tDiffuse"
    );
    this.shaderPasses.blurYShaderPass.material.uniforms.pDiffuse = this.pxlEnv.scene.renderGlowTarget.texture;
    this.shaderPasses.blurYShaderPass.material.transparent = true;
    this.shaderPasses.blurYShaderPass.enabled=false;
    this.shaderPasses.blurYShaderPass.name="blurYShaderPass";
    this.blurComposer.addPass( this.shaderPasses.blurYShaderPass );
  
    
    this.shaderPasses.scatterMixShaderPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.pxlTimer.msRunner },
          tDiffuse: { value: null },
          pDiffuse: { value: null },
          resUV: { value: this.pxlDevice.screenRes },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.mixBlurShaderPass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.shaderPasses.scatterMixShaderPass.material.uniforms.pDiffuse = this.pxlEnv.scene.renderGlowTarget.texture;
    this.shaderPasses.scatterMixShaderPass.material.transparent = true;
    this.shaderPasses.scatterMixShaderPass.enabled=false;
    this.shaderPasses.scatterMixShaderPass.name="scatterMixShaderPass";
    this.blurComposer.addPass( this.shaderPasses.scatterMixShaderPass );
    
      
    // Set Anti-Aliasing Quality
    if( this.pxlOptions.antiAliasing===ANTI_ALIASING.LOW){
      this.shaderPasses.scatterMixShaderPass.enabled=true;
    }else if( this.pxlOptions.antiAliasing===ANTI_ALIASING.MEDIUM){
      this.shaderPasses.blurXShaderPass.enabled=true;
      this.shaderPasses.dirBlurCopyPass.enabled=true;
      this.shaderPasses.blurYShaderPass.enabled=true;
    }else if( this.pxlOptions.antiAliasing===ANTI_ALIASING.HIGH ){
      this.shaderPasses.blurXShaderPass.enabled=true;
      this.shaderPasses.dirBlurCopyPass.enabled=true;
      this.shaderPasses.blurYShaderPass.enabled=true;
      this.shaderPasses.scatterMixShaderPass.enabled=true;
    }




    ///////////////////////////////////////////////////
    // -- POST PROCESSING; MAIN MENU  -- -- -- -- -- //
    ///////////////////////////////////////////////////
    // Post Processing
    
    this.mapComposerMotionBlur=new EffectComposer(this.engine);
    
    this.mapMotionBlurPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
          camRotXYZ:{ value:this.pxlCamera.camRotXYZ },
          blurDirCur:{ type:'f',value:this.blurDirCur },
          blurDirPrev:{ type:'f',value:this.blurDirPrev },
          noiseTexture: { value: this.pxlEnv.cloud3dTexture },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.motionBlurPostProcess(this.pxlDevice.screenRes,this.pxlDevice.mobile),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapMotionBlurPass.material.uniforms.rDiffuse = this.pxlEnv.scene.renderTarget.texture;
    this.mapMotionBlurPass.needsSwap = true;
    this.mapMotionBlurPass.name = "mapMotionBlurPass";
    this.mapComposerMotionBlur.addPass(this.mapMotionBlurPass);
    this.mapMotionBlurPass.enabled=false;
    this.mapComposerMotionBlur.renderToScreen=false;
    //this.mapComposerMotionBlur.autoClear=false;
    
    // -- -- -- -- -- -- -- -- -- -- //
    
    this.mapComposerGlow=new EffectComposer(this.engine);
    
    let renderGlowPass = new RenderPass(this.pxlEnv.scene, this.pxlCamera.camera);
    this.mapComposerGlow.addPass(renderGlowPass);
    
    this.blurScreenMerge = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          mtDiffuse: { value: null },
          exposure:{type:"f",value:this.pxlRenderSettings.exposure}
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.compLayersPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
    this.blurScreenMerge.material.uniforms.rDiffuse = this.pxlEnv.scene.renderTarget.texture;
    // TODO : Motion Blur pass, performance is slow but should be enableable through 'options'
    //this.blurScreenMerge.material.uniforms.mtDiffuse = this.mapComposerMotionBlur.renderTarget2.texture;
    this.blurScreenMerge.material.uniforms.mtDiffuse = this.pxlEnv.scene.renderTarget.texture;
    this.blurScreenMerge.needsSwap = true;
    this.blurScreenMerge.name = "blurScreenMerge";
    this.mapComposerGlow.addPass(this.blurScreenMerge);
    
    let glowCopyPassBlur = new ShaderPass(CopyShader);
    glowCopyPassBlur.name = "glowCopyPassBlur";
    this.mapComposerGlow.addPass(glowCopyPassBlur);
    
    //this.mapGlowPass = new UnrealBloomPass( new Vector2( this.pxlDevice.mapW*this.pxlQuality.bloomPercMult, this.pxlDevice.mapH*this.pxlQuality.bloomPercMult ), .28, 0.08, 0.13 );
    //this.mapGlowPass.threshold = this.pxlRenderSettings.bloomThresh;
    //this.mapGlowPass.strength = this.pxlRenderSettings.bloomStrength;
    //this.mapGlowPass.radius = this.pxlRenderSettings.bloomRadius;
    /*this.mapGlowPass = new BloomPass( this.pxlRenderSettings.bloomStrength, 50, 4, 512);
    this.mapGlowPass.threshold = this.pxlRenderSettings.bloomThresh;
    this.mapGlowPass.strength = this.pxlRenderSettings.bloomStrength;
    this.mapGlowPass.radius = this.pxlRenderSettings.bloomRadius;*/
    //this.mapGlowPass.clear=true;
    
    //this.mapComposerGlow.addPass(this.mapGlowPass);
    this.mapComposerGlow.renderToScreen=false;
    this.mapComposerGlow.autoClear=true;

    this.mapOverlayHeavyPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
          camPos: { value: this.pxlCamera.camera.position },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          bloomTexture: { value: null },
          sceneDepth: { value: null },
          scenePos: { value: null },
          noiseTexture: { value: this.pxlEnv.cloud3dTexture },
          fogMult: { value: this.fogMult },
          proximityMult: { value: 1 },
          //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.finalOverlayHeavyShader(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapOverlayHeavyPass.material.uniforms.rDiffuse = this.pxlEnv.scene.renderTarget.texture;
    this.mapOverlayHeavyPass.material.uniforms.bloomTexture = this.mapComposerGlow.renderTarget2.texture;
    this.mapOverlayHeavyPass.material.uniforms.sceneDepth = this.pxlEnv.scene.renderTarget.depthTexture;
    this.mapOverlayHeavyPass.material.uniforms.scenePos = this.pxlEnv.scene.renderWorldPos.texture;
    this.mapOverlayHeavyPass.needsSwap = true;
    this.mapOverlayHeavyPass.name = "mapOverlayHeavyPass";

    this.mapOverlayPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
                    camPos: { value: this.pxlCamera.camera.position },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          bloomTexture: { value: null },
          sceneDepth: { value: null },
          scenePos: { value: null },
          noiseTexture: { value: this.pxlEnv.cloud3dTexture },
          fogMult: { value: this.fogMult },
          proximityMult: { value: 1 },
          //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.finalOverlayShader(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapOverlayPass.material.uniforms.rDiffuse = this.pxlEnv.scene.renderTarget.texture;
    this.mapOverlayPass.material.uniforms.bloomTexture = this.mapComposerGlow.renderTarget2.texture;
    this.mapOverlayPass.material.uniforms.sceneDepth = this.pxlEnv.scene.renderTarget.depthTexture;
    this.mapOverlayPass.material.uniforms.scenePos = this.pxlEnv.scene.renderWorldPos.texture;
    this.mapOverlayPass.needsSwap = true;
    this.mapOverlayPass.name = "mapOverlayPass";
    
    this.mapOverlaySlimPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
          exposure:{type:"f",value:this.pxlRenderSettings.exposure},
          time:{ value:this.pxlTimer.msRunner },
          camPos: { value: this.pxlCamera.camera.position },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          bloomTexture: { value: null },
          sceneDepth: { value: null },
          fogMult: { value: this.fogMult },
          proximityMult: { value: 1 },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.finalOverlaySlimShader(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapOverlaySlimPass.material.uniforms.rDiffuse = this.pxlEnv.scene.renderTarget.texture;
    //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
    this.mapOverlaySlimPass.material.uniforms.bloomTexture = this.mapComposerGlow.renderTarget2.texture;
    this.mapOverlaySlimPass.material.uniforms.sceneDepth = this.pxlEnv.scene.renderTarget.depthTexture;
    this.mapOverlaySlimPass.needsSwap = true;
    this.mapOverlaySlimPass.name = "mapOverlaySlimPass";

    // -- -- -- -- -- -- -- -- -- -- //
    
    this.mapGlowPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          time:{ value:this.pxlTimer.msRunner },
          ratio:{ type:'f',value: 1 },
          tDiffuse: { value: null },
          rDiffuse: { value: null },
          sceneDepth: { value: null },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.glowPassPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapGlowPass.material.uniforms.rDiffuse = this.pxlEnv.scene.renderGlowTarget.texture;
    this.mapGlowPass.material.uniforms.sceneDepth = this.pxlEnv.scene.renderTarget.depthTexture;
    this.mapGlowPass.needsSwap = true;
    this.mapGlowPass.name = "mapGlowPass";

    // -- -- -- -- -- -- -- -- -- -- //
    
    this.mapComposer = new EffectComposer(this.engine);
    
    this.mapComposer.addPass( this.mapOverlayHeavyPass );
    this.mapComposer.addPass( this.mapOverlayPass );
    this.mapComposer.addPass( this.mapOverlaySlimPass );
    this.mapComposer.addPass( this.mapGlowPass );
    this.mapOverlayHeavyPass.enabled=false;
    this.mapOverlayPass.enabled=false;
    //this.mapOverlayPass.autoClear=true;
    //this.mapOverlaySlimPass.enabled=false;
    
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
    this.pxlUser.lKingWarp=new Vector2( ...this.pxlUser.lKingInactive );
        
    this.lizardKingPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          time:{ value:this.pxlTimer.msRunner },
          ratio: { value: this.pxlDevice.screenRes },
          noiseTexture: { value: this.pxlEnv.cloud3dTexture },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.lKingPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
        this.pxlUser.lizardKingPass=this.lizardKingPass;
        this.lizardKingPass.enabled=false;
        this.pxlUser.lizardKingPass.name = "lizardKingPass";
    
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
    this.pxlUser.starFieldPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          time:{ value:this.pxlTimer.msRunner },
          ratio: { value: this.pxlDevice.screenRes },
          noiseTexture: { value: this.pxlEnv.cloud3dTexture },
          starTexture: { value: this.pxlUtils.loadTexture(this.pxlUtils.assetRoot+"uv_starNoise.jpg", null, {"encoding":LinearSRGBColorSpace}) },
        },
        vertexShader: this.pxlShaders.rendering.sFieldPostProcessVert(),
        fragmentShader: this.pxlShaders.rendering.sFieldPostProcessFrag(),
        defines: {}
      } ), "tDiffuse"
    );
        this.pxlUser.starFieldPass.enabled=false;
        this.pxlUser.starFieldPass.name = "starFieldPass";
    
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
    this.pxlUser.crystallinePass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          tDiffusePrev: {type:'t', value: null },
          time:{ value:this.pxlTimer.msRunner },
          ratio: { value: this.pxlDevice.screenRes },
          noiseTexture: { value: this.pxlEnv.cloud3dTexture },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.iZoomPostProcess(),
        defines: {}
      } ), "tDiffuse"
    );
        this.pxlUser.crystallinePass.enabled=false;
        this.pxlUser.crystallinePass.name = "crystallinePass";
    
        
        
        // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

    
    if( this.pxlOptions.postProcessPasses.chromaticAberrationPass ){
      this.chromaticAberrationPass = new ShaderPass(
        new ShaderMaterial( {
          uniforms: {
            tDiffuse: { value: null },
            ratio: { value: this.pxlDevice.screenRes },
            warpMult: { value: this.chroAberMult },
            chroAberUVTexture: { value: this.chroAberUVTexture },
            chroAberUVAlpha: { value: this.chroAberUVAlpha },
            lKing: { value: this.pxlUser.lKingWarp },
          },
          vertexShader: this.pxlShaders.core.defaultVert(),
          fragmentShader: this.pxlShaders.rendering.chroAberPostProcess(),
          defines: {}
        } ), "tDiffuse"
      );
      this.chromaticAberrationPass.enabled=false;
      this.chromaticAberrationPass.name = "chromaticAberrationPass";
      this.mapComposer.addPass( this.chromaticAberrationPass );
    }
    
    if( this.pxlOptions.postProcessPasses.lizardKingPass ){
      this.mapComposer.addPass( this.lizardKingPass );
    }
    //if( !this.mobile ) {
    if( this.pxlOptions.postProcessPasses.starFieldPass ){
      this.mapComposer.addPass( this.pxlUser.starFieldPass );
    }
    if( this.pxlOptions.postProcessPasses.crystallinePass ){
      this.mapComposer.addPass( this.pxlUser.crystallinePass );
    }
    
    if( this.pxlOptions.postProcessPasses.mapComposerWarpPass ){
      this.mapComposerWarpPass = new ShaderPass(
        new ShaderMaterial( {
          uniforms: {
            time:{ value:this.pxlTimer.msRunner },
            fader:{ value:this.pxlEnv.warpVisualFader },
            tDiffuse: { value: null },
            noiseTexture: { value: this.pxlEnv.cloud3dTexture },
            animTexture: { value: this.pxlEnv.blockAnimTexture  },
            //bloomTexture: { value: this.mapComposerMotionBlur.renderTarget2.texture }
          },
          vertexShader: this.pxlShaders.core.camPosVert(),
          fragmentShader: this.pxlShaders.rendering.warpPostProcess(),
          defines: {}
        } ), "tDiffuse"
      );
      this.mapComposerWarpPass.needsSwap = true;
      this.mapComposerWarpPass.enabled=false;
      this.mapComposerWarpPass.name = "mapComposerWarpPass";
      this.mapComposer.addPass( this.mapComposerWarpPass );
    }
        // 8 Samples
    this.mapBoxAAPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          resUV:{ type:'f',value:this.pxlDevice.screenRes },
          ratio:{ type:'f',value: 1 },
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
        },
        vertexShader: this.pxlShaders.core.camPosVert(),
        fragmentShader: this.pxlShaders.rendering.boxAntiAliasPass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapBoxAAPass.enabled=false;
    this.mapBoxAAPass.name = "mapBoxAAPass";
    this.mapComposer.addPass( this.mapBoxAAPass );
        
        // 4 samples
    this.mapCrossAAPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          resUV:{ type:'f',value:this.pxlDevice.screenRes },
          ratio:{ type:'f',value: 1 },
          gamma:{type:"f",value:this.pxlDevice.gammaCorrection},
        },
        vertexShader: this.pxlShaders.core.camPosVert(),
        fragmentShader: this.pxlShaders.rendering.crossAntiAliasPass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.mapCrossAAPass.enabled=false;
    this.mapCrossAAPass.name = "mapCrossAAPass";
    this.mapComposer.addPass( this.mapCrossAAPass );
    
    this.mapComposer.autoClear=true;
    
    // -- -- -- -- -- -- -- -- -- -- //
    
    // External Room composer
    let bootScene= this.pxlEnv.roomSceneList[this.pxlEnv.bootRoom].scene; // this.pxlEnv.roomSceneList['ShadowPlanet'].scene ||
    this.roomComposer=new EffectComposer(this.engine);

    this.roomRenderPass = new RenderPass(bootScene, this.pxlCamera.camera);
    this.roomRenderPass.name = "roomRenderPass";
    this.roomComposer.addPass(this.roomRenderPass);
        
        
    this.pxlEnv.roomNameList.forEach( (r)=>{
      if( r !== this.mainRoom){
        let curPass=this.pxlEnv.roomSceneList[ r ].applyRoomPass( this.roomComposer );
        if( curPass ){
            curPass.enabled=false;
            this.roomComposer.addPass( curPass );
        }
      }
    });
        
    
    this.roomBloomPass = new UnrealBloomPass( new Vector2( this.pxlDevice.mapW*.5, this.pxlDevice.mapH*.5 ), 1.5, 0.8, 0.85 );
    this.roomBloomPass.threshold = this.pxlRenderSettings.bloomThresh;
    this.roomBloomPass.strength = this.pxlRenderSettings.bloomStrength;
    this.roomBloomPass.radius = this.pxlRenderSettings.bloomRadius;
    this.roomBloomPass.name = "roomBloomPass";
    this.roomComposer.addPass( this.roomBloomPass );
    
    
    if( this.pxlOptions.postProcessPasses.roomGlowPass ){
      this.roomGlowPass = new ShaderPass(
        new ShaderMaterial( {
          uniforms: {
            time:{ value:this.pxlTimer.msRunner },
            ratio:{ type:'f',value: 1 },
            tDiffuse: { value: null },
            gDiffuse: { value: null },
            rDiffuse: { value: null },
            sceneDepth: { value: null },
          },
          vertexShader: this.pxlShaders.core.defaultVert(),
          fragmentShader: this.pxlShaders.rendering.glowPassPostProcess(),
          defines: {}
        } ), "tDiffuse"
      );
      
      //gDiffuse: { value: this.pxlEnv.scene.renderGlowTarget.texture },
      //gDiffuse: { value: this.blurComposer.renderTarget1.texture },
      this.roomGlowPass.material.uniforms.gDiffuse = this.blurComposer.writeBuffer.texture;
      this.roomGlowPass.material.uniforms.rDiffuse = this.blurComposer.renderTarget2.texture;
      this.roomGlowPass.material.uniforms.sceneDepth = this.pxlEnv.scene.renderTarget.depthTexture;
      this.roomGlowPass.needsSwap = true;
      this.roomGlowPass.name = "roomGlowPass";

      this.roomComposer.addPass( this.roomGlowPass );
    }
    
    if( this.pxlOptions.postProcessPasses.chromaticAberrationPass ){
      this.roomComposer.addPass( this.chromaticAberrationPass );
    }
    
    if( this.pxlOptions.postProcessPasses.lizardKingPass ){
      this.roomComposer.addPass( this.lizardKingPass );
    }
    
    if( this.pxlOptions.postProcessPasses.starFieldPass ){
      this.roomComposer.addPass( this.pxlUser.starFieldPass );
    }

    if( this.pxlOptions.postProcessPasses.crystallinePass ){
      this.roomComposer.addPass( this.pxlUser.crystallinePass );
    }

    if( this.pxlOptions.postProcessPasses.mapComposerWarpPass ){
      this.roomComposer.addPass( this.mapComposerWarpPass );
    }
        
    this.roomComposer.addPass( this.mapCrossAAPass );
    this.roomComposer.addPass( this.mapBoxAAPass );
        
    this.roomComposer.autoClear=true;
        
        // -- -- -- -- -- -- -- -- //
        
    
        // -- -- -- -- -- -- -- -- //
        // Set above, for pass to use renderTarget in uniforms
    this.delayComposer=new EffectComposer(this.engine);
    
    //let renderDelayPass = new RenderPass(this.pxlEnv.scene, this.pxlCamera.camera);
    //this.delayComposer.addPass(renderDelayPass);
        
    this.delayPass = new ShaderPass(
      new ShaderMaterial( {
        uniforms: {
          tDiffuse: { value: null },
          roomComposer: { type:"f", value : 0 },
          tDiffusePrev: { value: null },
          tDiffusePrevRoom: { value: null },
        },
        vertexShader: this.pxlShaders.core.defaultVert(),
        fragmentShader: this.pxlShaders.rendering.textureStorePass(),
        defines: {}
      } ), "tDiffuse"
    );
    this.delayPass.material.uniforms.tDiffusePrev = this.mapComposer.renderTarget1.texture;
    this.delayPass.material.uniforms.tDiffusePrevRoom = this.roomComposer.renderTarget1.texture;
    //this.delayPass.needsSwap = true;
    this.delayPass.clear=false;
    this.delayComposer.addPass( this.delayPass );
    this.delayComposer.renderToScreen=false;
    this.delayComposer.autoClear=false;
        
    this.pxlUser.crystallinePass.uniforms.tDiffusePrev.value = this.delayComposer.renderTarget2.texture;
  }

  /**
   * 
   * @param {*} canvasW 
   * @param {*} canvasH 
   */
  resize( canvasW, canvasH ){
    if( this.pxlEnv.mapComposer ) this.pxlEnv.mapComposer.setSize(canvasW,canvasH);
    if( this.pxlEnv.mapComposerGlow ) this.pxlEnv.mapComposerGlow.setSize(canvasW,canvasH);
    
    // For external rooms --
    if( this.pxlEnv.roomComposer ){
      this.pxlEnv.roomComposer.setSize( canvasW, canvasH);
    }
  
    if( this.pxlEnv.roomGlowPass ){
      this.pxlEnv.roomGlowPass.setSize(canvasW*this.pxlQuality.bloomPercMult,canvasH*this.pxlQuality.bloomPercMult);
    }

    // -- -- -- -- -- -- --
        
    // For texture swapping --
    if( this.pxlEnv.delayComposer ) this.pxlEnv.delayComposer.setSize(canvasW,canvasH);

    // -- -- -- -- -- -- --
        
    if( this.pxlEnv.mapGlowPass ){
      this.pxlEnv.mapGlowPass.setSize(canvasW*this.pxlQuality.bloomPercMult,canvasH*this.pxlQuality.bloomPercMult);
    }
    
    if( this.pxlEnv.mapMotionBlurPass ){
      this.pxlEnv.mapMotionBlurPass.setSize(canvasW*this.pxlQuality.mBlurPercMult,canvasH*this.pxlQuality.mBlurPercMult);
    }
    
    if( this.pxlEnv.mapOverlayHeavyPass ){
      this.pxlEnv.mapOverlayHeavyPass.setSize(canvasW,canvasH);
      this.pxlEnv.mapOverlayHeavyPass.uniforms.ratio.value = Math.min( 1, canvasW/canvasH );
    }
    
    if( this.pxlEnv.mapOverlayPass ){
      this.pxlEnv.mapOverlayPass.setSize(canvasW,canvasH);
      this.pxlEnv.mapOverlayPass.uniforms.ratio.value = Math.min( 1, canvasW/canvasH );
    }

    if( this.pxlEnv.mapOverlaySlimPass ){
      this.pxlEnv.mapOverlaySlimPass.setSize(canvasW,canvasH);
      this.pxlEnv.mapOverlaySlimPass.uniforms.ratio.value = Math.min( 1, canvasW/canvasH );
    }
  }


  // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
  // -- Render & Buffer Helper Functions -- -- -- //
  // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

  
  // Set composer uniforms
  /**
   * @memberof pxlRendering
   * @function updateCompUniforms
   * @description Update the exposure uniform for the rendering composers
   * @param {number} exposure 
   */
  updateCompUniforms(exposure=null){
    if(exposure){
      this.pxlRenderSettings.exposure=exposure*this.pxlRenderSettings.mult;
    }
    if(this.mapOverlayPass){
      this.mapMotionBlurPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      this.mapOverlayHeavyPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      this.mapOverlayPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      this.mapOverlaySlimPass.uniforms.exposure.value = this.pxlRenderSettings.exposure;
      //this.blurScreenMerge.uniforms.exposure.value = this.pxlRenderSettings.exposure;
    }
  }


  // TODO : Re-implement to room passes
  //          It got disconnected during refactor
  /**
   * @memberof pxlRendering
   * @function stepShaderValues
   * @description Step shader variables for shaders that need to update values each frame
   */
  stepShaderValues(){ // ## Switch variables in shaders to three variables to avoid this whole thing  
    this.stepShaderFuncArr.forEach((x)=>{
      if(typeof(x)=="object"){
        x.step();
      }else if(typeof(x)=="string"){
        //console.log("shader trigger?");
        //console.log(x);
        //(x);
      }
    });
  }


}