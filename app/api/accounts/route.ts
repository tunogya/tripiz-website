import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {verifyEvent} from "nostr-tools/pure";

const POST = async (req: NextRequest) => {
  const { id, kind, pubkey, created_at, content, tags, sig } = await req.json();

  if (kind !== 0) {
    return Response.json({
      error: "kind should be 0",
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

  const { db } = await connectToDatabase();

  const result = await db.collection("events").updateOne({
    id,
  }, {
    $set: {
      kind,
      pubkey,
      content,
      tags,
      sig,
      created_at,
    },
  }, {
    upsert: true,
  });

  if (result.upsertedId) {
    return Response.json({
      id: result.upsertedId,
    });
  } else {
    return Response.json({
      error: "Something went wrong",
    });
  }
};

export {
  POST
}