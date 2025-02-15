import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
      // console.log("Received body:", body);
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    if (!body || !body.message) {
      console.log("Message is missing!");
      return NextResponse.json(
        { error: "Message array is required" },
        { status: 400 }
      );
    }

    const { message } = body;
    // console.log("Received message:", message);

    // Ensure 'message' is treated as part of a conversation array
    // const conversation = Array.isArray(message)
    //   ? message.map((msg: { role: string; content: string }) => ({
    //       role: msg.role,
    //       content: msg.content,
    //     }))
    //   : [{ role: "user", content: message }]; // ✅ If 'message' is a string, wrap it in an array

    // console.log("📤 Sending to LM API:", { conversation });

    const apiKey = process.env.LM_API_KEY;
    if (!apiKey) {
      console.error("❌ API key is missing!");
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const response = await fetch(
      "https://api.lmscale.tech/v1/assistant/chat/completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          message, // ✅ Pass user input
          conversation: [{ role: "user", content: message }], // ✅ Create a conversation dynamically
        }),
      }
    );

    // console.log("API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      // console.error("LM API Error:", errorText);
      return NextResponse.json(
        { error: `LM API request failed: ${errorText}` },
        { status: response.status }
      );
    }

    // const data = await response.json();
    // console.log("AI Response:", data);

    // ✅ Stream response word-by-word
    // const reader = response.body?.getReader();
    // const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        // Store the full response

        if (!reader) {
          controller.close();
          return;
        }

        // let accumulatedText = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            // ✅ Extract JSON parts from "data: {...}" format
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data:")) {
                try {
                  const json = JSON.parse(line.replace("data: ", "").trim());
                  if (json.response) {
                    let accumulatedText = "";

                    // ✅ Send each word separately with a delay
                    const words = json.response.split(" ");
                    for (const word of words) {
                      if (word.trim() !== "") {
                        accumulatedText += word + " "; // ✅ Keep track of full response
                        controller.enqueue(accumulatedText); // ✅ Stream the accumulated text
                        await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust delay as needed
                      }
                    }
                  }
                  if (json.done) {
                    controller.close();
                  }
                } catch (error) {
                  console.error("JSON Parsing Error:", error, "Line:", line);
                }
              }
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return NextResponse.json(
      { error: error || "Internal Server Error" },
      { status: 500 }
    );
  }
}
