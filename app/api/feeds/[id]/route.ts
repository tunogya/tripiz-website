import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {ObjectId} from "@datastax/astra-db-ts";
import {Post} from "@/utils/type";

const POST = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const feed = await db.collection<Post>("posts").findOne({
    _id: new ObjectId(id),
  })

  if (!feed) {
    return Response.json({
      error: "Something went wrong",
    })
  }

  const updatePost = await db.collection<Post>("posts").updateOne({
    _id: new ObjectId(id)
  }, {
    $set: {
      entities: feed.ai_entities,
      ai_entities: {},
      updatedAt: new Date(),
    }
  })

  if (updatePost.modifiedCount) {
    return Response.json({
      updated: true
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    }, {
      status: 500,
    })
  }
}

const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("posts").updateOne({
    _id: new ObjectId(id)
  }, {
    $set: {
      updatedAt: new Date(),
    },
    $unset: {
      ai_entities: "",
    }
  })

  if (!result.modifiedCount) {
    return Response.json({
      error: "Something went wrong",
    })
  }

  return Response.json({
    deleted: true
  })
}

export {
  POST,
  DELETE
}