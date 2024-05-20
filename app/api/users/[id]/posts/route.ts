import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const category = req.nextUrl.searchParams.get("category");

  const results = await db.collection("posts").find({
    user: id,
    ...(category && {
      category
    }),
  }, {
    limit: 10,
    sort: {updatedAt: -1},
    projection: {
      $vector: 0
    }
  }).toArray();

  if (results) {
    return Response.json({
      data: results
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

export {
  GET
}