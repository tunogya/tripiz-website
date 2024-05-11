import {NextRequest, NextResponse} from "next/server";

const POST = async (req: NextRequest) => {
  return NextResponse.json({
    success: true
  }, {
    status: 200
  });
}

export {POST}