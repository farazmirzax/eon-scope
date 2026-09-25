import { NextResponse } from "next/server";
import sharp from "sharp";

const GPLATES_URL =
  "https://gws.gplates.org/reconstruct/coastlines/";

const MODEL = "ZAHIROVIC2022";

const TILE_EXTENTS = [
  "-180,0,0,90",
  "0,180,0,90",
  "-180,0,-90,0",
  "0,180,-90,0",
];

async function fetchTile(
  time: number,
  extent: string
): Promise<Buffer> {
  const params = new URLSearchParams({
    time: String(time),
    model: MODEL,
    fmt: "png",
    facecolor: "#8f8a72",
    edgecolor: "#d7c49a",
    alpha: "1",
    extent,
    central_meridian: "0",
    wrap: "true",
  });

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

  return Buffer.from(
    await response.arrayBuffer()
  );
}

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

  for (let i = 0; i < data.length; i += info.channels) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    const isBlackBackground =
      red < 25 &&
      green < 25 &&
      blue < 25;

    if (isBlackBackground) {
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
  const { searchParams } = new URL(request.url);

  const time = Number(
    searchParams.get("time")
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
      {
        status: 400,
      }
    );
  }

  try {
    const rawTiles = await Promise.all(
      TILE_EXTENTS.map((extent) =>
        fetchTile(time, extent)
      )
    );

    const tiles = await Promise.all(
      rawTiles.map(removeBlackBackground)
    );

    const metadata = await sharp(
      tiles[0]
    ).metadata();

    if (
      !metadata.width ||
      !metadata.height
    ) {
      throw new Error(
        "Unable to determine GPlates PNG dimensions."
      );
    }

    const tileWidth = metadata.width;
    const tileHeight = metadata.height;

    const outputWidth = tileWidth * 2;
    const outputHeight = tileHeight * 2;

    const image = await sharp({
      create: {
        width: outputWidth,
        height: outputHeight,
        channels: 4,
        background: {
          r: 0,
          g: 0,
          b: 0,
          alpha: 0,
        },
      },
    })
      .composite([
        {
          input: tiles[0],
          left: 0,
          top: 0,
        },
        {
          input: tiles[1],
          left: tileWidth,
          top: 0,
        },
        {
          input: tiles[2],
          left: 0,
          top: tileHeight,
        },
        {
          input: tiles[3],
          left: tileWidth,
          top: tileHeight,
        },
      ])
      .png()
      .toBuffer();

    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error(
      "GPlates paleomap error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to retrieve the reconstructed paleomap.",
      },
      {
        status: 502,
      }
    );
  }
}