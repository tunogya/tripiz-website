import {NextRequest} from "next/server";
import {embedding} from "@/utils/embedding";
import openai from "@/utils/openai";
import {connectToDatabase} from "@/utils/astradb";
import {Event} from "@/utils/type";
import {ObjectId} from "@datastax/astra-db-ts";

const POST = async (req: NextRequest) => {
  const {id, kind, address, created_at, content, tags, sig} = await req.json();

  if (!id || !kind || !address || !created_at || !content || !sig) {
    return Response.json({
      error: "Missing required fields: text, user",
    }, {
      status: 400
    })
  }

  let $vector: number[] = [], possibly_sensitive = false;

  try {
    const [vector, moderation] = await Promise.all([
      embedding(content),
      openai.moderations.create({
        input: content,
      })
    ])
    $vector = vector;
    possibly_sensitive = moderation.results[0].flagged;
  } catch (e) {
    console.log(e)
  }

  const {db} = await connectToDatabase();
  // id, kind, address, created_at, content, tags, sig
  const result = await db.collection<Event>("events").insertOne({
    _id: new ObjectId(),
    id,
    kind,
    address,
    created_at,
    content,
    tags,
    sig,
    possibly_sensitive,
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
  POST
}