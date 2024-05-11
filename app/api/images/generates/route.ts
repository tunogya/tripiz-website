import {NextRequest, NextResponse} from "next/server";

const GET = async (req: NextRequest) => {
  return NextResponse.json({
    success: true
  }, {
    status: 200
  });
}

export default GET