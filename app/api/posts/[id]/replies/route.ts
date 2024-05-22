import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {Post} from "@/utils/type";
import {ObjectId} from "@datastax/astra-db-ts";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("posts").find({
    parent_post_id: new ObjectId(id),
  }, {
    sort: {updatedAt: -1},
    projection: {
      $vector: 0,
    }
  }).toArray();

  if (!result) {
    return Response.json({
      error: "Something went wrong",
    })
  }
  return Response.json({
    data: result.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }))
  })
}

export {GET}