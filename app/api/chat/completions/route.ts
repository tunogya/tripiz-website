import {NextRequest, NextResponse} from "next/server";

const CHAT_COMPLETION = "https://api.openai.com/v1/chat/completions";
const VERCEL_URL = "https://tripiz.abandon.ai";

const POST = async (req: NextRequest) => {
  const { messages, model, max_tokens, temperature } = await req.json();
  try {
    const response = await fetch(`${process.env.QSTASH_URL + CHAT_COMPLETION}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.QSTASH_TOKEN}`,
        "Upstash-Forward-Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "Upstash-Method": "POST",
        "Upstash-Callback": `${VERCEL_URL}/api/callback`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature,
        stream: false,
      }),
    });
    const json = await response.json();
    return NextResponse.json({
      id: json.messageId,
    }, {
      status: 202
    });
  } catch (error) {
    return NextResponse.json({
      error: "Internal server error",
    }, {
      status: 500
    });
  }
}

export {POST}