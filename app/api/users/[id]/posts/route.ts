import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/mongodb";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { coreDb } = await connectToDatabase();

  const category = req.nextUrl.searchParams.get("category");

  const results = await coreDb.collection("posts").find({
    author: id,
    ...(category && {
      category
    }),
  }, {
    limit: 10,
    sort: {createdAt: -1},
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