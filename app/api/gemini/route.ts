import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log("Received message:", message);

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "Available" : "Missing");
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    // ✅ Make API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    console.log("API Response Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: `Gemini API request failed: ${errorText}` }, { status: response.status });
    }

    const data = await response.json(); // ✅ Correctly parse JSON before streaming

    console.log("Full API Response:", data);

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: data.error.code });
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // ✅ Create a stream for word-by-word response
    const stream = new ReadableStream({
      async start(controller) {
        const words = aiResponse.split(" ");
        for (const word of words) {
          controller.enqueue(word + " "); // Send each word with a space
          await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate real-time delay
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
