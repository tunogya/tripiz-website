import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {embedding} from "@/utils/embedding";

const GET = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams.get("query");
  const user = req.headers.get("Tripiz-User");
  const signature = req.headers.get("Tripiz-Signature");

  if (!user || !signature) {
    return Response.json({
      error: "Missing required fields: Tripiz-User, Tripiz-Signature"
    }, {
      status: 403
    })
  }

  if (!query) {
    return Response.json({
      error: "Missing required fields: query"
    }, {
      status: 400
    })
  }

  const { db } = await connectToDatabase();
  const similarPosts = await db.collection("posts").find(
      {
        user: user,
      },
      {
        vector: await embedding(query),
        limit: 10,
        projection: { $vector: 0 },
      }
    )
    .toArray();

  return Response.json({
    data: similarPosts.map((item) => ({
      ...item,
      _id: item._id?.toString()
    })),
  })
}

export {GET}