import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/mongodb";
import {ObjectId} from "mongodb";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id
  const { coreDb } = await connectToDatabase();

  const result = await coreDb.collection("replies").findOne({
    _id: new ObjectId(id)
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
  const { coreDb } = await connectToDatabase();

  const result = await coreDb.collection("replies").deleteOne({
    _id: new ObjectId(id)
  })

  if (!result.acknowledged) {
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