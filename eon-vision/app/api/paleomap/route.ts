import { NextResponse } from "next/server";

const GPLATES_URL =
  "https://gws.gplates.org/reconstruct/coastlines/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const time = Number(searchParams.get("time"));

  if (!Number.isFinite(time) || time <= 0 || time > 200) {
    return NextResponse.json(
      { error: "Invalid geological time." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    time: String(time),
    model: "ZAHIROVIC2022",
    fmt: "png",
    facecolor: "#8f8a72",
    edgecolor: "#d7c49a",
    alpha: "1",
    extent: "-180,180,-90,90",
    central_meridian: "0",
    wrap: "true",
  });

  try {
    const response = await fetch(
      `${GPLATES_URL}?${params.toString()}`,
      {
        headers: {
          Accept: "image/png",
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `GPlates returned ${response.status}`
      );
    }

    const image = await response.arrayBuffer();

    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "image/png",
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
      { status: 502 }
    );
  }
}