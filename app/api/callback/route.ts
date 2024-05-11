import {NextRequest, NextResponse} from "next/server";
import redis from "@/utils/redis";

const GET = async (req: NextRequest) => {
  const body = await req.json();
  try {
    const decoded = atob(body);
    await redis.set(body.sourceMessageId, decoded, {
      ex: 60 * 60 * 24 * 30,
    });
    return NextResponse.json({
      success: true
    }, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({error, success: false,}, {
      status: 500,
    });
  }
}

export {GET}