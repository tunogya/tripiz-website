import {NextRequest, NextResponse} from "next/server";

const DALL_E = "https://api.openai.com/v1/images/generations";
const VERCEL_URL = "https://tripiz.abandon.ai";

const POST = async (req: NextRequest) => {
  const { prompt } = await req.json();
  try {
    const response = await fetch(`${process.env.QSTASH_URL + DALL_E}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.QSTASH_TOKEN}`,
        "Upstash-Forward-Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "Upstash-Method": "POST",
        "Upstash-Callback": `${VERCEL_URL}/api/callback?token=${process.env.CALLBACK_TOKEN}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
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
      error: error,
      type: "Internal server error"
    }, {
      status: 500
    });
  }
}

export {POST}