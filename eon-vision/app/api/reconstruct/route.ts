import { NextResponse } from "next/server";

const LUCKNOW_LATITUDE = 26.8467;
const LUCKNOW_LONGITUDE = 80.9462;

const GPLATES_URL =
  "https://gws.gplates.org/reconstruct/reconstruct_points/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const time = Number(searchParams.get("time"));

  if (!Number.isFinite(time) || time < 0 || time > 200) {
    return NextResponse.json(
      { error: "Invalid geological time." },
      { status: 400 }
    );
  }

  // Present day doesn't need a network request.
  if (time === 0) {
    return NextResponse.json({
      latitude: LUCKNOW_LATITUDE,
      longitude: LUCKNOW_LONGITUDE,
      time: 0,
      plateId: null,
    });
  }

  const params = new URLSearchParams({
    lats: String(LUCKNOW_LATITUDE),
    lons: String(LUCKNOW_LONGITUDE),
    time: String(time),
    model: "ZAHIROVIC2022",
    fc: "",
  });

  try {
    const response = await fetch(`${GPLATES_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GPlates returned ${response.status}`);
    }

    const data = await response.json();

    const feature = data?.features?.[0];

    if (!feature?.geometry?.coordinates) {
      return NextResponse.json(
        {
          error: "GPlates did not return a valid reconstructed position.",
        },
        { status: 502 }
      );
    }

    const [longitude, latitude] = feature.geometry.coordinates;

    return NextResponse.json({
      latitude,
      longitude,
      time,
      plateId: feature.properties?.plateId ?? null,
    });
  } catch (error) {
    console.error("GPlates reconstruction error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve the paleo-position from GPlates.",
      },
      { status: 502 }
    );
  }
}