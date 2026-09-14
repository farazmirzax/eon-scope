"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { FeatureCollection } from "geojson";

const EARTH_RADIUS = 2;
const LAND_OFFSET = 0.012;

interface PaleoLandProps {
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

function triangulateRing(
  ring: number[][]
): number[] {
  if (ring.length < 4) {
    return [];
  }

  const points = ring.slice(0, -1).map(
    ([longitude, latitude]) =>
      new THREE.Vector2(longitude, latitude)
  );

  const triangles =
    THREE.ShapeUtils.triangulateShape(
      points,
      []
    );

  const positions: number[] = [];

  for (const triangle of triangles) {
    for (const index of triangle) {
      const [longitude, latitude] =
        ring[index];

      const position = latLonToVector3(
        latitude,
        longitude,
        EARTH_RADIUS + LAND_OFFSET
      );

      positions.push(
        position.x,
        position.y,
        position.z
      );
    }
  }

  return positions;
}

export default function PaleoLand({
  data,
}: PaleoLandProps) {
  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (const feature of data.features) {
      const geometry = feature.geometry;

      if (!geometry) {
        continue;
      }

      if (geometry.type === "Polygon") {
        const outerRing =
          geometry.coordinates[0];

        positions.push(
          ...triangulateRing(outerRing)
        );
      }

      if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          const outerRing = polygon[0];

          positions.push(
            ...triangulateRing(outerRing)
          );
        }
      }
    }

    const bufferGeometry =
      new THREE.BufferGeometry();

    bufferGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        positions,
        3
      )
    );

    bufferGeometry.computeVertexNormals();

    return bufferGeometry;
  }, [data]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#8f8a72"
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}