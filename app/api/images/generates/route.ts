import {NextRequest, NextResponse} from "next/server";

const QSTASH = `https://qstash.upstash.io/v1/publish/`;
const DALL_E = "https://api.openai.com/v1/images/generations";
const VERCEL_URL = "https://dalle-2-jade.vercel.app";

const POST = async (req: NextRequest) => {
  const { prompt } = await req.json();
  try {
    const response = await fetch(`${QSTASH + DALL_E}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.QSTASH_TOKEN}`,
        "Upstash-Forward-Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "Upstash-Method": "POST",
        "Upstash-Callback": `${VERCEL_URL}/api/callback`,
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
      success: true,
      id: json.messageId,
    }, {
      status: 202
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error,
      type: "Internal server error"
    }, {
      status: 500
    });
  }
}

export {POST}