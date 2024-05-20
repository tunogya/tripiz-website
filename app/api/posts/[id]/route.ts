import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {ObjectId} from "@datastax/astra-db-ts";
import {Post} from "@/utils/type";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id
  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("posts").findOne({
    _id: new ObjectId(id),
  })

  if (!result) {
    return Response.json({
      error: "Something went wrong",
    })
  }
  return Response.json({
    data: result
  })
}

const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("posts").deleteOne({
    _id: new ObjectId(id)
  })

  if (!result.deletedCount) {
    return Response.json({
      error: "Something went wrong",
    })
  }

  return Response.json({
    deleted: true
  })
}

export {
  GET,
  DELETE
}