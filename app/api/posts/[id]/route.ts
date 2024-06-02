import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {ObjectId} from "@datastax/astra-db-ts";
import {Post} from "@/utils/type";
import {embedding} from "@/utils/embedding";
import openai from "@/utils/openai";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("posts").findOne({
    _id: new ObjectId(id),
  }, {
    projection: {
      $vector: 0,
    }
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
      updatedAt: result.updated_at,
      createdAt: result.created_at,
    }
  })
}

const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id
  const { text, signature } = await req.json();

  if (!text) {
    return Response.json({
      error: "Missing required fields: text",
    }, {
      status: 400
    })
  }

  let $vector: number[] = [], possibly_sensitive = false;

  try {
    const [vector, moderation] = await Promise.all([
      embedding(text),
      openai.moderations.create({
        input: text,
      })
    ])
    $vector = vector;
    possibly_sensitive = moderation.results[0].flagged;
  } catch (e) {
    console.log(e)
  }

  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("posts").updateOne({
    _id: new ObjectId(id)
  }, {
    $set: {
      text,
      possibly_sensitive,
      signature,
      $vector,
      updated_at: new Date(),
    }
  })

  if (result.modifiedCount) {
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
  PUT,
  DELETE
}