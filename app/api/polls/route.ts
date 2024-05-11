import {NextRequest, NextResponse} from "next/server";
import redis from "@/utils/redis";

const GET = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) return NextResponse.json({
    error: "No id provided"
  }, {
    status: 400
  })

  try {
    const data = await redis.get(id);
    if (!data) return NextResponse.json({ error: "No data found" }, { status: 404 });
    else return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export {GET}