import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const GET = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams.get("query");

  if (!query) {
    return Response.json({
      error: "Missing required fields: query"
    }, {
      status: 400
    })
  }

  const { db } = await connectToDatabase();



}

export {GET}