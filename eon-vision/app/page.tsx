"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Earth from "@/components/Earth";
import TimeSlider from "@/components/TimeSlider";

export default function Home() {
  const [time, setTime] = useState(0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* 3D Earth */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />

          <directionalLight
            position={[5, 3, 5]}
            intensity={2.5}
          />

          <Earth />

          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={10}
          />
        </Canvas>
      </div>

      {/* Header */}
      <div className="pointer-events-none absolute left-6 top-6 z-10">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
          EonScope
        </p>

        <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">
          Earth through time
        </h1>

        <p className="mt-2 max-w-md text-sm text-white/50">
          Explore the world from a different point in Earth's history.
        </p>
      </div>

      {/* Location */}
      <div className="absolute right-6 top-6 z-10 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Location
        </p>

        <p className="mt-1 text-lg font-medium text-white">
          📍 Lucknow, India
        </p>
      </div>

      {/* Time controls */}
      <div className="absolute bottom-6 left-1/2 z-10 w-[calc(100%-3rem)] -translate-x-1/2">
        <TimeSlider
          value={time}
          onChange={setTime}
        />
      </div>
    </main>
  );
}