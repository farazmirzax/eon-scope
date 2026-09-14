"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { FeatureCollection } from "geojson";

import Earth from "@/components/Earth";
import TimeSlider from "@/components/TimeSlider";

const PRESENT_LATITUDE = 26.8467;
const PRESENT_LONGITUDE = 80.9462;

interface ReconstructionData {
  latitude: number;
  longitude: number;
  time: number;
  plateId: number | null;
}

export default function Home() {
  const [time, setTime] = useState(0);

  const [latitude, setLatitude] = useState(
    PRESENT_LATITUDE
  );

  const [longitude, setLongitude] = useState(
    PRESENT_LONGITUDE
  );

  const [coastlineData, setCoastlineData] =
    useState<FeatureCollection | null>(null);

  const [loading, setLoading] = useState(false);
  const [coastlineLoading, setCoastlineLoading] =
    useState(false);

  const [error, setError] = useState(false);

  // Reconstruct Lucknow's position
  useEffect(() => {
    if (time === 0) {
      setLatitude(PRESENT_LATITUDE);
      setLongitude(PRESENT_LONGITUDE);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `/api/reconstruct?time=${time}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Reconstruction request failed."
          );
        }

        const data: ReconstructionData =
          await response.json();

        setLatitude(data.latitude);
        setLongitude(data.longitude);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [time]);

  // Retrieve reconstructed coastlines
  useEffect(() => {
    if (time === 0) {
      setCoastlineData(null);
      setCoastlineLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setCoastlineLoading(true);

        const response = await fetch(
          `/api/coastlines?time=${time}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Coastline request failed."
          );
        }

        const data: FeatureCollection =
          await response.json();

        setCoastlineData(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(error);
        setCoastlineData(null);
      } finally {
        setCoastlineLoading(false);
      }
    }, 700);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [time]);

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

          <Earth
            latitude={latitude}
            longitude={longitude}
            time={time}
            coastlineData={coastlineData}
          />

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
          Explore the world from a different point in
          Earth's history.
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

        {time > 0 && (
          <p className="mt-1 text-xs text-white/40">
            Paleo-position:{" "}
            {latitude.toFixed(2)}°,{" "}
            {longitude.toFixed(2)}°
          </p>
        )}

        {loading && (
          <p className="mt-2 text-xs text-cyan-300">
            Reconstructing...
          </p>
        )}

        {coastlineLoading && (
          <p className="mt-1 text-xs text-white/40">
            Rebuilding ancient geography...
          </p>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-400">
            Reconstruction unavailable
          </p>
        )}
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