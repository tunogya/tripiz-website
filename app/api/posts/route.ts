import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {embedding} from "@/utils/embedding";
import openai from "@/utils/openai";
import {convertTagsToDict} from "@/utils/convertTagsToDict";

const GET = async (req: NextRequest) => {
  const ids = req.nextUrl.searchParams.get("ids")?.split(',').map((item) => item) || [];

  if (ids.length === 0) {
    return Response.json({
      error: "Missing required fields: ids"
    }, {
      status: 400
    })
  }

  const {db} = await connectToDatabase();

  const results = await db.collection("events").find({id: {$in: ids}}).toArray();

  if (results) {
    return Response.json({
      data: results,
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

const POST = async (req: NextRequest) => {
  const {id, kind, pubkey, created_at, content, tags, sig} = await req.json();

  if (!id || !kind || !pubkey || !created_at || !content || !tags || !sig) {
    return Response.json({
      error: "Missing required fields: id, kind, pubkey, created_at, content, tags, sig",
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

  const result = await db.collection("events").insertOne({
    id,
    kind,
    pubkey,
    content,
    tags,
    sig,
    possibly_sensitive,
    created_at,
    tags_map: convertTagsToDict(tags),
    $vector,
  })
  if (result.insertedId) {
    return Response.json({
      id: result.insertedId,
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