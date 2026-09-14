"use client";

import * as THREE from "three";

const EARTH_RADIUS = 2;
const MARKER_OFFSET = 0.04;

const LUCKNOW_LATITUDE = 26.8467;
const LUCKNOW_LONGITUDE = 80.9462;

function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number
) {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function LocationMarker() {
  const position = latLonToVector3(
    LUCKNOW_LATITUDE,
    LUCKNOW_LONGITUDE,
    EARTH_RADIUS + MARKER_OFFSET
  );

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.035, 20, 20]} />

      <meshBasicMaterial color="#ff3b30" />
    </mesh>
  );
}