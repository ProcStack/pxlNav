
/**
 * @namespace pxlUser
 * @description User Object
 */

export class User{
  constructor(id=null){

    this.pxlEnums=null;
    this.pxlEnv=null;
    this.pxlTimer=null;

    this.id=null;
    this.Stats=null;
    this.jmaConnectObj=false;
    this.jmaServer=false;
    this.jmaRoom=false;
    this.jmaUserId=null;
    this.jmaUserName=null;
    this.jmaTempUserIdActive=false;
    
    this.welcome=false;
    
    this.tankStrafe=false;
    this.invertMouse=false;

    // -- -- --
    
    this.moveSpeed = 1.0;
    this.moveSpeedSlow = 0.5;
    this.moveSpeedBase = 1.0;
    this.moveSpeedBoost = 2.0; // Hold shift to boost

    // -- -- --

    this.renderSettingsCookie="settings_renderSettings";
    this.controlModeCookie="settings_controlMode";
    this.tankStrageCookie="settings_tankStrage";
    this.invertMouseCookie="settings_invertMouse";
    this.rootUserCookie="data_userEnlil";
    this.adminUserCookie="data_userNanna";
    
    this.localUserMoved=false;
    this.localUserTurned=false;
        
    this.itemRunTime=60; // Time in Seconds an Item is Active
    this.itemGroupList=[];
    this.itemList={};
    this.itemListNames=[];
    this.itemBaseList=[];
    this.itemActiveList=[];
    this.itemInactiveCmd=[];
    this.itemActiveTimer=[];
    this.itemRotateRate=.65;
    this.itemBaseRotateRate=.1;
    this.itemBobRate=.35;
    this.itemBobMag=.0;
    this.mPick=[];
    
    this.activeEffects={};
    
    this.lowGrav=0;
        
    // -- -- --

    // TODO : Awaiting the much needed Item Manager vv

    this.lKing=0;
    this.lKingInactive=[.025, .018];
    this.lKingActive=[.35,.25];
    this.lKingWarp=0;
    this.lizardKingPass=null;
        
    this.sField=0;
    this.sFieldWarp=0;
    this.starFieldPass=null;
        
    this.iZoom=0;
    this.iZoomWarp=0;
    this.crystallinePass=null;

    // -- -- --
        
  }



  // -- -- --

  setDependencies( pxlNav ){
    this.pxlEnums=pxlNav.pxlEnums;
    this.pxlEnv=pxlNav.pxlEnv;
    this.pxlTimer=pxlNav.pxlTimer;
  }

  // -- -- --

  setSlowSpeed( speed ){
    speed = Math.max( 0.001, speed );
    this.moveSpeedSlow = speed;
  }

  setBaseSpeed( speed ){
    speed = Math.max( 0.001, speed );
    this.moveSpeedBase = speed;
  }

  setBoostSpeed( speed ){
    speed = Math.max( 0.001, speed );
    this.moveSpeedBoost = speed;
  }
  
  // -- -- --

  // Nothing triggers STOP or SLOW yet
  //   But can be ran from pxlRooms
  setSpeed( enumType ){
    switch(enumType){
      case this.pxlEnums.USER_SPEED.STOP:
        this.moveSpeed = 0;
        break;
      case this.pxlEnums.USER_SPEED.SLOW:
        this.moveSpeed = this.moveSpeedBase * this.moveSpeedSlow;
        break;
      case this.pxlEnums.USER_SPEED.BASE:
        this.moveSpeed = this.moveSpeedBase;
        break;
      case this.pxlEnums.USER_SPEED.BOOST:
        this.moveSpeed = this.moveSpeedBase * this.moveSpeedBoost;
        break;
      default:
        //Something broke, reset to base
        this.moveSpeed = this.moveSpeedBase;
        break;
    }
  }

  // -- -- --

  checkItemWearOff(curTime){
    if(this.itemActiveList.length > 0){
      let timeLeft=this.itemActiveTimer[0]-curTime;
      if(timeLeft<=0){
        let cmd=this.itemInactiveCmd.shift();
        cmd();
        this.itemActiveTimer.shift();
        this.itemActiveList.shift();
        return true;
      }
    }
    return false;
  }
  checkItemPickUp(itemName){
    if(itemName==="LowGravity"){
      if(this.lowGrav===0){
        this.lowGrav=1;
        return true;
      }else{
        return false;
      }
    }else if( itemName==="LizardKing" ){
      if(this.lKing===0){
        this.lKing=1;
                this.lKingWarp.set( ...this.lKingActive );
                this.lizardKingPass.enabled=true;
                //this.lKingRoomPass.enabled=true;
        return true;
      }else{
        return false;
      }
    }else if( itemName==="StarField" ){
      if(this.sField===0){
        this.sField=1;
                this.starFieldPass.enabled=true;
                //this.lKingRoomPass.enabled=true;
        return true;
      }else{
        return false;
      }
    }else if( itemName==="InfinityZoom" ){
      if(this.iZoom===0){
        this.iZoom=1;
                this.crystallinePass.enabled=true;
        return true;
      }else{
        return false;
      }
    }
  }
  toggleTankRotate(active=null){
    this.tankStrafe= active===null ? !this.tankStrafe : active;
    this.tankStrageText= this.tankStrafe ? "Left/Right Rotation" : "Left/Right Strafe" ;
  }
  toggleMouseInf(active=null){
    this.invertMouse= active===null ? !this.invertMouse : active;
    this.invertMouseText= this.invertMouse ? "Revert Mouse" : "Invert Mouse" ;
  }
  toggleFpsStats(){
    /*if(this.pxlTimer.fpsStats === -1){
      this.pxlTimer.fpsStats=new Stats();
      document.body.appendChild(this.pxlTimer.fpsStats.domElement);
      this.pxlTimer.fpsStats.update();
      this.fpsDisplayText="Hide FPS Stats";
    }else{
      this.pxlTimer.fpsStats.domElement.remove();
      this.pxlTimer.fpsStats=-1;
      this.fpsDisplayText="Display FPS Stats";
    }*/
  }
}