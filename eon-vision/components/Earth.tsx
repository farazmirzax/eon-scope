"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

import LocationMarker from "./LocationMarker";

interface EarthProps {
  latitude: number;
  longitude: number;
  time: number;
}

const EARTH_RADIUS = 2;
const PALEO_MAP_OFFSET = 0.008;

export default function Earth({
  latitude,
  longitude,
  time,
}: EarthProps) {
  const earthRef = useRef<THREE.Mesh>(null);

  const paleoTextureUrl =
    time > 0
      ? `/api/paleomap?time=${time}`
      : "/textures/earth-day.jpg";

  const [dayTexture, normalTexture, paleoTexture] =
    useLoader(THREE.TextureLoader, [
      "/textures/earth-day.jpg",
      "/textures/earth-normal.jpg",
      paleoTextureUrl,
    ]);

  dayTexture.colorSpace = THREE.SRGBColorSpace;
  paleoTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0015;
    }
  });

  const isPresent = time === 0;

  return (
    <>
      <mesh ref={earthRef}>
        {/* Base Earth */}
        <sphereGeometry
          args={[EARTH_RADIUS, 64, 64]}
        />

        {isPresent ? (
          <meshStandardMaterial
            map={dayTexture}
            normalMap={normalTexture}
            roughness={0.75}
            metalness={0.05}
          />
        ) : (
          <meshStandardMaterial
            color="#06152f"
            roughness={0.9}
            metalness={0}
          />
        )}

        {/* Reconstructed paleo-Earth */}
        {time > 0 && (
          <mesh
            scale={[
              1 +
                PALEO_MAP_OFFSET / EARTH_RADIUS,
              1 +
                PALEO_MAP_OFFSET / EARTH_RADIUS,
              1 +
                PALEO_MAP_OFFSET / EARTH_RADIUS,
            ]}
          >
            <sphereGeometry
              args={[EARTH_RADIUS, 64, 64]}
            />

            <meshBasicMaterial
              map={paleoTexture}
              transparent
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Lucknow paleo-position marker */}
        <LocationMarker
          latitude={latitude}
          longitude={longitude}
        />
      </mesh>

      {/* Atmosphere */}
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