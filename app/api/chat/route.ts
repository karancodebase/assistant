import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    console.log("📢 Received request at /api/chat"); // Debug log

    console.log("🔍 OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
    console.log("🔍 USER_SECRET_TOKEN:", process.env.USER_SECRET_TOKEN);

    const body = await req.json();
    console.log("📢 Request body:", body); // Debug log

    const { message } = body;

    if (!message) {
      console.error("❌ Error: No message provided");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const userToken = req.headers.get("x-user-token");
    if (userToken !== process.env.USER_SECRET_TOKEN) {
      console.error("❌ Error: Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("📢 Sending request to OpenAI...");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // or "gpt-3.5-turbo"
      messages: [{ role: "user", content: message }],
    });
    

    console.log("📢 OpenAI Response:", response);

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error: unknown) {
    console.error("❌ Internal Server Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
