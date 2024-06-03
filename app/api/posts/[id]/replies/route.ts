import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const result = db.collection("events").find({
    kind: 1,
    tags: {
      $elemMatch: { $eq: ["e", id] }
    },
  }, {
    projection: {
      sig: 0,
      $vector: 0,
    }
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

export {GET}