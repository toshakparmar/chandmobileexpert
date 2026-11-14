"use client";
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && (args[0].includes("THREE.Clock") || args[0].includes("THREE.WebGLProgram"))) return;
    originalWarn.apply(console, args);
  };
}

import React, { memo, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";

const PHONE_CONFIG = {
  path: "/models/iphone_17_pro_max.glb",
  scale: 18,
  position: [0, -1.2, 0] as const,
  rotation: [0.05, -0.35, 0] as const,
};

const PhoneModel = memo(function PhoneModel() {
  const { scene } = useGLTF(PHONE_CONFIG.path);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive
        object={clonedScene}
        scale={PHONE_CONFIG.scale}
        position={PHONE_CONFIG.position}
        rotation={PHONE_CONFIG.rotation}
      />
    </Float>
  );
});

// Preload the phone model
useGLTF.preload(PHONE_CONFIG.path);

export function Hero3DCanvas() {
  return (
    <div className="relative w-full h-[270px] min-[360px]:h-[320px] sm:h-[460px] md:h-[560px] flex items-center justify-center mx-auto cursor-grab active:cursor-grabbing touch-pan-y">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 44 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[10, 10, 5]} intensity={2.4} />
        <directionalLight position={[-10, 10, -5]} intensity={1.4} />
        <directionalLight position={[0, -10, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <PhoneModel />
          <ContactShadows
            position={[0, -2.1, 0]}
            opacity={0.35}
            scale={10}
            blur={2.5}
            far={4}
            resolution={256}
            frames={1}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.8}
            maxPolarAngle={Math.PI / 1.7}
            autoRotate
            autoRotateSpeed={1.0}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

