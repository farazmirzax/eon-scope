"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import type { FeatureCollection } from "geojson";

import LocationMarker from "./LocationMarker";
import PaleoCoastlines from "./PaleoCoastlines";

interface EarthProps {
  latitude: number;
  longitude: number;
  time: number;
  coastlineData: FeatureCollection | null;
}

export default function Earth({
  latitude,
  longitude,
  time,
  coastlineData,
}: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);

  const [dayTexture, normalTexture] = useLoader(
    THREE.TextureLoader,
    [
      "/textures/earth-day.jpg",
      "/textures/earth-normal.jpg",
    ]
  );

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0015;
    }
  });

  const isPresent = time === 0;

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />

        {isPresent ? (
          <meshStandardMaterial
            map={dayTexture}
            normalMap={normalTexture}
            roughness={0.75}
            metalness={0.05}
          />
        ) : (
          <meshStandardMaterial
            color="#071d4a"
            roughness={0.9}
            metalness={0}
          />
        )}

        {time > 0 && coastlineData && (
          <PaleoCoastlines data={coastlineData} />
        )}

        <LocationMarker
          latitude={latitude}
          longitude={longitude}
        />
      </mesh>

      <mesh scale={1.025}>
        <sphereGeometry args={[2, 64, 64]} />

        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}