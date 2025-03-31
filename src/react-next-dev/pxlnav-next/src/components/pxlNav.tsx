'use client';

import { useEffect, useRef } from 'react';
import { pxlNav, pxlEnums, pxlUserSettings, pxlOptions } from 'pxlnav';

export default function PxlNav() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const pxlNavOptions = {
      verbose: pxlEnums.VERBOSE_LEVEL.INFO,
      fps: {
        pc: 60,
        mobile: 30
      },
      renderScale: {
        pc: 1.0,
        mobile: 1.5
      },
      antiAliasing: pxlEnums.ANTI_ALIASING.LOW,
      shadowMapBiasing: pxlEnums.SHADOW_MAP.SOFT,
      skyHaze: pxlEnums.SKY_HAZE.VAPOR,
      collisionScale: {
        gridSize: 100,
        gridReference: 1000
      },
      pxlRoomRoot: "/pxlRooms",
      pxlAssetRoot: "/pxlAssets",
      showOnboarding: true,
      staticCamera: false,
      allowStaticRotation: true,
      userSettings: pxlUserSettings
    };

    const bootRoomList = ["OutletEnvironment"];
    const projectTitle = "pxlNav :: Next.js";
    
    const pxlNavEnv = new pxlNav(
      pxlNavOptions,
      projectTitle,
      bootRoomList[0],
      bootRoomList
    );

    pxlNavEnv.init();

    return () => {
      // Cleanup if needed
      pxlNavEnv.dispose?.();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}