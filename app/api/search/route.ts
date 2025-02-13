import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received search request:", body);

    if (!body.query) {
      console.error("Error: Missing 'query' field");
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    if (!apiKey || !cx) {
      console.error("Google API Key or Search Engine ID missing.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      body.query
    )}&key=${apiKey}&cx=${cx}`;

    console.log("Fetching from Google Search API:", searchUrl);

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.error) {
      console.error("Google Search API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: data.error.code });
    }

    const results = data.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    })) || [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in Search API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
