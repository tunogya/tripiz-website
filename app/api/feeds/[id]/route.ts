import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {ObjectId} from "@datastax/astra-db-ts";
import {Post} from "@/utils/type";
import {embedding} from "@/utils/embedding";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("feeds").findOne({
    _id: new ObjectId(id),
  })

  if (!result) {
    return Response.json({
      error: "Something went wrong",
    })
  }
  return Response.json({
    data: {
      ...result,
      _id: result._id.toString(),
    }
  })
}

const POST = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const feed = await db.collection<Post>("feeds").findOne({
    _id: new ObjectId(id),
  })

  if (!feed) {
    return Response.json({
      error: "Something went wrong",
    })
  }

  let $vector = []

  try {
    $vector = await embedding(JSON.stringify({
      text: feed.text,
      entities: feed.entities,
    }));
  } catch (e) {
    console.log(e);
  }

  const updatePost = await db.collection<Post>("posts").updateOne({
    _id: new ObjectId(id)
  }, {
    $set: {
      entities: feed.entities,
      $vector,
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

  const result = await db.collection<Post>("feeds").deleteOne({
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
  POST,
  DELETE
}