import { NextRequest, NextResponse } from "next/server";

async function fetchFromGeminiAPI(message: string, apiKey: string) {
  // console.log("Sending request to Gemini API...");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }] // ✅ Correct payload format
      }),
    }
  );

  // console.log("Received response from Gemini API...");

  const data = await response.json();
  // console.log("Gemini API Response:", data);

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // console.log("Received request body:", body);

    const { message } = body;
    if (!message) {
      console.error("Error: Missing 'message' field in request");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Error: API key missing");
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const data = await fetchFromGeminiAPI(message, apiKey);

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: data.error.code });
    }

    return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
