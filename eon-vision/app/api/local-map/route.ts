import { NextResponse } from "next/server";
import sharp from "sharp";

const GPLATES_URL =
  "https://gws.gplates.org/reconstruct/coastlines/";

const MODEL = "ZAHIROVIC2022";

const HALF_EXTENT = 6;

async function removeBlackBackground(
  image: Buffer
): Promise<Buffer> {
  const result = await sharp(image)
    .ensureAlpha()
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });

  const { data, info } = result;

  for (
    let i = 0;
    i < data.length;
    i += info.channels
  ) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    const isBlack =
      red < 25 &&
      green < 25 &&
      blue < 25;

    if (isBlack) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toBuffer();
}

export async function GET(request: Request) {
  const { searchParams } =
    new URL(request.url);

  const time = Number(
    searchParams.get("time")
  );

  const latitude = Number(
    searchParams.get("latitude")
  );

  const longitude = Number(
    searchParams.get("longitude")
  );

  if (
    !Number.isFinite(time) ||
    time <= 0 ||
    time > 200
  ) {
    return NextResponse.json(
      {
        error: "Invalid geological time.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return NextResponse.json(
      {
        error: "Invalid latitude.",
      },
      { status: 400 }
    );
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      {
        error: "Invalid longitude.",
      },
      { status: 400 }
    );
  }

  const minLongitude =
    longitude - HALF_EXTENT;

  const maxLongitude =
    longitude + HALF_EXTENT;

  const minLatitude =
    Math.max(
      -90,
      latitude - HALF_EXTENT
    );

  const maxLatitude =
    Math.min(
      90,
      latitude + HALF_EXTENT
    );

  const extent = [
    minLongitude,
    maxLongitude,
    minLatitude,
    maxLatitude,
  ].join(",");

  const params = new URLSearchParams({
    time: String(time),
    model: MODEL,
    fmt: "png",
    facecolor: "#8f8a72",
    edgecolor: "#d7c49a",
    alpha: "1",
    extent,
    central_meridian: String(longitude),
    wrap: "true",
  });

  try {
    const response = await fetch(
      `${GPLATES_URL}?${params.toString()}`,
      {
        headers: {
          Accept: "image/png",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `GPlates returned ${response.status}`
      );
    }

    const rawImage = Buffer.from(
      await response.arrayBuffer()
    );

    const image =
      await removeBlackBackground(
        rawImage
      );

    return new NextResponse(new Uint8Array(image), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error(
      "GPlates local map error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to retrieve the local reconstructed geography.",
      },
      { status: 502 }
    );
  }
}