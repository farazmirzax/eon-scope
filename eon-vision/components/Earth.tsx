"use client";

import {
  Suspense,
  useRef,
} from "react";

import * as THREE from "three";

import {
  useFrame,
  useLoader,
} from "@react-three/fiber";

import LocationMarker from "./LocationMarker";

interface EarthProps {
  latitude: number;
  longitude: number;
  time: number;
}

const EARTH_RADIUS = 2;
const PALEO_MAP_OFFSET = 0.008;

function PresentEarth() {
  const [dayTexture, normalTexture] =
    useLoader(
      THREE.TextureLoader,
      [
        "/textures/earth-day.jpg",
        "/textures/earth-normal.jpg",
      ]
    );

  dayTexture.colorSpace =
    THREE.SRGBColorSpace;

  return (
    <mesh>
      <sphereGeometry
        args={[
          EARTH_RADIUS,
          64,
          64,
        ]}
      />

      <meshStandardMaterial
        map={dayTexture}
        normalMap={normalTexture}
        roughness={0.75}
        metalness={0.05}
      />
    </mesh>
  );
}

function PaleoEarth({
  time,
}: {
  time: number;
}) {
  const texture = useLoader(
    THREE.TextureLoader,
    `/api/paleomap?time=${time}&v=2`
  );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return (
    <>
      {/* Ocean base */}
      <mesh>
        <sphereGeometry
          args={[
            EARTH_RADIUS,
            64,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#06152f"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* GPlates reconstructed geography */}
      <mesh
        scale={
          1 +
          PALEO_MAP_OFFSET /
            EARTH_RADIUS
        }
      >
        <sphereGeometry
          args={[
            EARTH_RADIUS,
            64,
            64,
          ]}
        />

        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default function Earth({
  latitude,
  longitude,
  time,
}: EarthProps) {
  const earthGroup =
    useRef<THREE.Group>(null);

  useFrame(() => {
    if (earthGroup.current) {
      earthGroup.current.rotation.y +=
        0.0015;
    }
  });

  return (
    <>
      <group ref={earthGroup}>
        {time === 0 ? (
          <PresentEarth />
        ) : (
          <Suspense fallback={null}>
            <PaleoEarth time={time} />
          </Suspense>
        )}

        {/* Lucknow marker */}
        <LocationMarker
          latitude={latitude}
          longitude={longitude}
        />
      </group>

      {/* Atmosphere */}
      <mesh scale={1.025}>
        <sphereGeometry
          args={[
            EARTH_RADIUS,
            64,
            64,
          ]}
        />

        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>
    </>
  );
}