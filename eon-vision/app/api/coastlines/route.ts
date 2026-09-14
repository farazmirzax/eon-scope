import { NextResponse } from "next/server";

const GPLATES_URL =
  "https://gws.gplates.org/reconstruct/coastlines/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const time = Number(searchParams.get("time"));

  if (!Number.isFinite(time) || time < 0 || time > 200) {
    return NextResponse.json(
      { error: "Invalid geological time." },
      { status: 400 }
    );
  }

  if (time === 0) {
    return NextResponse.json({
      type: "FeatureCollection",
      features: [],
    });
  }

  const params = new URLSearchParams({
    time: String(time),
    model: "ZAHIROVIC2022",
  });

  try {
    const response = await fetch(
      `${GPLATES_URL}?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GPlates returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("GPlates coastline error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve reconstructed coastlines.",
      },
      { status: 502 }
    );
  }
}