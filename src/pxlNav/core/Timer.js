// pxlNav Timer
//   Written by Kevin Edzenga; 2020,2024,2025
// -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
//  Since there are a few different ways to calculate `deltaTime` in a runtime loop,
//    This take the time difference at the begining of the runtime loop step()
//      Incorporating real time user input detection, independent of frame rendering
//        Running at "browser animation frame" time
//
//  This may change in the future, since input detection and frame calculations run
//    While frame renders are locked to a given frame rate
//
// -- -- -- -- -- -- -- -- -- -- -- -- -- --
//
//  For runtime clock and time-based operations
//    Current time - `pxlNav.pxlTimer.curMS`
//    Delta time between frames - `pxlNav.pxlTimer.deltaTime`
//    An averaged delta time between frames - `pxlNav.pxlTimer.avgDeltaTime`
//      By default, averaging is 0.7 -
//        `this.avgDeltaTime = PreviousDeltaTime * (1.0-avgDeltaRate) + CurrentDeltaTime * avgDeltaRate`
//      This provides a blending between the absolute delta times, so this easing isn't a "lingering" blending
//        Averaging only takes into considering the prior 3 frames, being 2 delta times
//
//  When blending (Lerp / Slerp) operations,
//    Blending with deltaTime will cause a stuttering effects or mis-matched rates
//      Situations could arrise where `Value * deltaTime` may go above 1.0
//        This will cause blending (Lerp / Slerp) to blend instantly to the target value
//  To remedy this, pass your 'rate' for blending to -
//    deltaTime - `pxlNav.timer.getLerpRate( rate )`
//      -or-
//    avgDeltaTime - `pxlNav.timer.getLerpAvgRate( rate )`
//  This will return a deltaTime influenced rate using -
//    `1.0 - Math.pow( 0.5, deltaTime * rate )`
//      Providing a scalled rate better for blending operations


import { Vector2 } from "../../libs/three/three.module.min.js";

export class Timer{
  constructor(){
    this.active=false;
    this.msRunner=new Vector2(0,0);
    this.msLog=0;
    this.fpsStats=-1;
    
		let msTime=new Date().getTime()*.001;
    this._bootMS=msTime;
    this._prevWorldMS=msTime;
		this._curMS=msTime;
    this._prevMS=msTime;
    this.deltaTime=0;
    this.avgDeltaTime=0;

    this.avgDeltaRate = 0.7;  // Rate of averaging prior delta time with current delta time

    this._msRate = 0.001; // MS to Seconds
    this.baseRate = 0.001; // MS to Seconds
    
    this.videoFeeds=[];
    this.booted=false;
  }
  
  // Reset pxlNav clock
  //   Benchmarking steps the timer
  init(){
    if(!this.booted){
      this.prevMS=this.curMS;
      this.msRunner.x=0;
      this.msRunner.y=0;
      this.step();
      this.booted=true;
    }
  }
  
  get runtime(){
    return this._curMS-this._bootMS;
  }

  get curMS(){
      return this._curMS;
  }
  updateTime(){
      this._curMS=new Date().getTime() * this._msRate;
  }
  
  get prevMS(){
      return this._prevMS;
  }
  set prevMS( val ){
      this._prevMS=val;
  }

  get runtime(){
    return this._curMS-this._bootMS;
  }
  
  // -- -- --
  
  // Scale the time rate
  //   Since time is scaled, 
  scaleTime( scale ){
    this._msRate=this.baseRate*scale;
  }

  // -- -- --
  
  start(){
    this.play();
  }
    
  pause(){
    this.active=!this.active;
    return this.active;
  }
  
  play(){
    this.active=true;
    return this.active;
  }
  
  stop(){
    this.active=false;
    return this.active;
  }
  
  toggleMSLog(){
    this.msLog=(this.msLog+1)%2;
  }

  // -- -- --
  
  step(){
    let prevTime = this._curMS; 
		this.updateTime();

    // If the time was stepped multiple times in a single frame, ignore the step
    if( this._curMS == prevTime ){
      this._curMS = prevTime;
      return;
    }

		this.prevMS=prevTime;
        
    if(this.fpsStats!=-1){
      this.fpsStats.update();
    }
    

    let msDelta= this.curMS - this.prevMS;

    this.avgDeltaTime = this.deltaTime * (1.0-this.avgDeltaRate) + msDelta * this.avgDeltaRate;
    this.deltaTime = msDelta;
    this.msRunner.x += (msDelta>0?msDelta:0);
    this.msRunner.y = this.avgDeltaTime; // Prior-frame biased delta time
  }

  // -- -- --

  // In the case of changing rates of a Lerp,
  //  This will return a "deltaTime" influenced lerp rate
  // Note: Using deltaTime alone will cause a missmatch for your lerp rate
  getLerpRate( rate ){
    return 1.0 - Math.pow( 0.5, this.deltaTime * rate );
  }

  // If the Average Delta Time works better for your needs --
  getLerpAvgRate( rate ){
    return 1.0 - Math.pow( 0.5, this.avgDeltaTime * rate );
  }

}