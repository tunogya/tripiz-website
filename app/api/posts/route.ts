import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {ObjectId} from "@datastax/astra-db-ts";
import {Post} from "@/utils/type";
import {embedding} from "@/utils/embedding";
import openai from "@/utils/openai";

const GET = async (req: NextRequest) => {
  const ids = req.nextUrl.searchParams.get("ids")?.split(',').map((item) => new ObjectId(item)) || [];

  if (ids.length === 0) {
    return Response.json({
      error: "Missing required fields: ids"
    }, {
      status: 400
    })
  }

  const {db} = await connectToDatabase();

  const results = await db.collection<Post>("posts").find({_id: {$in: ids}}).toArray();

  if (results) {
    return Response.json({
      data: results.map((item) => ({
        ...item,
        _id: item._id?.toString()
      })),
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

const POST = async (req: NextRequest) => {
  const {_id, parent_post_id, text, user, category, entities} = await req.json();

  if (!text || !user) {
    return Response.json({
      error: "Missing required fields: text, user",
    }, {
      status: 400
    })
  }

  let $vector: number[] = [], flagged = false;

  try {
    const [vector, moderation] = await Promise.all([
      embedding(JSON.stringify({
        text,
        entities,
      })),
      openai.moderations.create({
        input: text,
      })
    ])
    $vector = vector;
    flagged = moderation.results[0].flagged;
  } catch (e) {
    console.log(e)
  }

  const {db} = await connectToDatabase();

  const result = await db.collection<Post>("posts").insertOne({
    _id: _id ? new ObjectId(_id) : new ObjectId(),
    parent_post_id: parent_post_id ? new ObjectId(parent_post_id) : undefined,
    user,
    text,
    flagged,
    category: category || "reflection",
    createdAt: new Date(),
    updatedAt: new Date(),
    entities,
    $vector,
  })
  if (result.insertedId) {
    return Response.json({
      id: result.insertedId.toString(),
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

export {
  GET,
  POST
}