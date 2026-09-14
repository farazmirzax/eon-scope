"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { FeatureCollection } from "geojson";

const EARTH_RADIUS = 2;
const COASTLINE_OFFSET = 0.018;

interface PaleoCoastlinesProps {
  data: FeatureCollection;
}

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

function addRingSegments(
  positions: number[],
  ring: number[][]
) {
  if (ring.length < 2) {
    return;
  }

  for (let i = 0; i < ring.length - 1; i++) {
    const current = ring[i];
    const next = ring[i + 1];

    if (
      Math.abs(next[0] - current[0]) > 180
    ) {
      continue;
    }

    const currentPosition = latLonToVector3(
      current[1],
      current[0],
      EARTH_RADIUS + COASTLINE_OFFSET
    );

    const nextPosition = latLonToVector3(
      next[1],
      next[0],
      EARTH_RADIUS + COASTLINE_OFFSET
    );

    positions.push(
      currentPosition.x,
      currentPosition.y,
      currentPosition.z,
      nextPosition.x,
      nextPosition.y,
      nextPosition.z
    );
  }
}

export default function PaleoCoastlines({
  data,
}: PaleoCoastlinesProps) {
  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (const feature of data.features) {
      const geometry = feature.geometry;

      if (!geometry) {
        continue;
      }

      if (geometry.type === "Polygon") {
        for (const ring of geometry.coordinates) {
          addRingSegments(positions, ring);
        }
      }

      if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          for (const ring of polygon) {
            addRingSegments(positions, ring);
          }
        }
      }
    }

    const bufferGeometry = new THREE.BufferGeometry();

    bufferGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        positions,
        3
      )
    );

    return bufferGeometry;
  }, [data]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#d7c49a"
        transparent
        opacity={0.9}
      />
    </lineSegments>
  );
}