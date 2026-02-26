import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { videoId: string; title: string }>();

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  // Return cached result if we have one
  if (cache.has(query)) {
    return NextResponse.json(cache.get(query));
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API not configured" },
      { status: 500 },
    );
  }

  const searchQuery = `${query} exercise form tutorial`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&videoDuration=medium&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message || "YouTube API error" },
      { status: res.status },
    );
  }

  if (data.items && data.items.length > 0) {
    const result = {
      videoId: data.items[0].id.videoId,
      title: data.items[0].snippet.title,
    };
    cache.set(query, result);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "No results found" }, { status: 404 });
}
