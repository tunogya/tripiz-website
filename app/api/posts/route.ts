import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {embedding} from "@/utils/embedding";
import openai from "@/utils/openai";
import {convertTagsToDict} from "@/utils/convertTagsToDict";
import {verifyEvent} from "nostr-tools/pure";

const GET = async (req: NextRequest) => {
  const ids =
    req.nextUrl.searchParams
      .get("ids")
      ?.split(",")
      .map((item) => item) || [];

  if (ids.length === 0) {
    return Response.json(
      {
        error: "Missing required fields: ids",
      },
      {
        status: 400,
      },
    );
  }

  const {db} = await connectToDatabase();

  const results = await db
    .collection("events")
    .find({id: {$in: ids}})
    .toArray();

  if (results) {
    return Response.json({
      data: results,
    });
  } else {
    return Response.json({
      error: "Something went wrong",
    });
  }
};

const POST = async (req: NextRequest) => {
  const {id, kind, pubkey, created_at, content, tags, sig} = await req.json();

  if (kind !== 1) {
    return Response.json({
      error: "kind should be 1",
    })
  }

  const isValid = verifyEvent({
    id,
    kind,
    pubkey,
    created_at,
    content,
    tags,
    sig,
  });

  if (!isValid) {
    return Response.json(
      {
        error: "Invalid event",
      },
      {
        status: 400,
      },
    );
  }

  let $vector: number[] = [],
    possibly_sensitive = false;

  try {
    const [vector, moderation] = await Promise.all([
      embedding(content),
      openai.moderations.create({
        input: content,
      }),
    ]);
    $vector = vector;
    possibly_sensitive = moderation.results[0].flagged;
  } catch (e) {
    console.log(e);
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
  });
  if (result.insertedId) {
    return Response.json({
      id: result.insertedId,
    });
  } else {
    return Response.json({
      error: "Something went wrong",
    });
  }
};

export {GET, POST};
