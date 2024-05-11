import {NextRequest, NextResponse} from "next/server";
import redis from "@/utils/redis";

const POST = async (req: NextRequest) => {
  const body = await req.json();
  try {
    const bodyString = JSON.stringify(body);
    await redis.set(body.sourceMessageId, bodyString, {
      ex: 60 * 60 * 24 * 30,
    });
    return NextResponse.json({
      success: true
    }, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({error: "Internal server error"}, {
      status: 500,
    });
  }
}

export {POST}