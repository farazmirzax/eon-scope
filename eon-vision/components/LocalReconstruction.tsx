"use client";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface LocalReconstructionProps {
  latitude: number;
  longitude: number;
  time: number;
}

export default function LocalReconstruction({
  latitude,
  longitude,
  time,
}: LocalReconstructionProps) {
  const texture = useLoader(
    THREE.TextureLoader,
    `/api/local-map?time=${time}&latitude=${latitude}&longitude=${longitude}`
  );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 8;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry
        args={[8, 8]}
      />

      <meshBasicMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}