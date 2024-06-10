import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";
import redis from "@/utils/redis";
import openai from "@/utils/openai";
import { finalizeEvent, getPublicKey } from "nostr-tools/pure";
import { generateSecretKey } from "@/utils/generateSecretKey";
import { convertTagsToDict } from "@/utils/convertTagsToDict";

const salt = process.env.SALT || "0";

const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const id = params.id;

  let max_results: number = Number(
    req.nextUrl.searchParams.get("max_results") || 20,
  );
  const skip: number | undefined = Number(
    req.nextUrl.searchParams.get("skip") || 0,
  );

  if (max_results > 20 || max_results <= 0) {
    return Response.json(
      {
        error: "max_results should > 0 and <= 20",
      },
      {
        status: 400,
      },
    );
  }

  const { db } = await connectToDatabase();

  const results = await db
    .collection("events")
    .find(
      {
        kind: 1,
        "tags_map.e.0": id,
      },
      {
        limit: max_results,
        sort: { created_at: -1 },
        skip: skip,
        projection: {
          $vector: 0,
        },
      },
    )
    .toArray();

  if (results.length === 0) {
    await fetch(`https://tripiz.abandon.ai/api/posts/${id}/replies`, {
      method: "POST",
    });
  }

  const hasNext = results.length === max_results;

  return Response.json({
    data: results,
    pagination: {
      hasNext,
      nextSkip: hasNext ? skip + results.length : null,
    },
  });
};

const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const isWorking = await redis.get(`working:${params.id}`);
  if (isWorking) {
    return Response.json(
      {
        error: "Already working",
      },
      {
        status: 403,
      },
    );
  }
  await redis.set(`working:${params.id}`, true, {
    ex: 5 * 60,
  });
  const { db } = await connectToDatabase();
  const post = await db.collection("events").findOne({
    id: params.id,
  });

  if (!post) {
    return Response.json(
      {
        error: "404",
      },
      {
        status: 404,
      },
    );
  }
  const pubkey = post.pubkey;
  const possibly_sensitive = post.possibly_sensitive || false;

  if (possibly_sensitive) {
    return Response.json(
      {
        error: "Possibly sensitive content",
      },
      {
        status: 403,
      },
    );
  }

  const promptOfReflection = `#### User Requirement Description:
The user will write a reflection on their memories, dreams, or thoughts. Your task is to:

1. Identify multiple historical texts that closely match the user's reflection and evoke emotional resonance.
2. These texts can be quotes from historical figures or characters in literature.
3. Ensure the texts are authentic and not fictional.

#### Return Format:
If suitable texts are found, use the user's language to respond and return a JSON array with each element containing:

- \`"name"\`: The author or character of the text.
- \`"text"\`: The text that resonates with the user's reflection.

Example:
\`\`\`json
{
  "data": [
  {"name": "Li Bai", "text": "Heaven has endowed me with talents, and they will be put to good use. Wealth may be scattered, but it will return."},
  {"name": "Marcus Aurelius", "text": "The happiness of your life depends upon the quality of your thoughts."}
]
}
\`\`\`

If no suitable texts are found, return an empty array.`

  const request = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: promptOfReflection,
      },
      {
        role: "user",
        content: post.content,
      },
    ],
    model: "gpt-4o",
    stream: false,
    temperature: 0.5,
    max_tokens: 4096,
    response_format: {
      type: "json_object",
    },
    user: pubkey,
  });

  const reply = request.choices[0].message.content;

  if (!reply) {
    return Response.json({
      error: "Something went wrong",
    });
  }

  const data = JSON.parse(reply)?.data || [];

  let eventsKind1 = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    let userSk = generateSecretKey(salt, item.name.toLowerCase()); // `sk` is a Uint8Array
    const userPubkey = getPublicKey(userSk);

    const exist = await db.collection("events").findOne({
      kind: 0,
      pubkey: userPubkey,
    });

    if (!exist) {
      const randomNumber = Math.floor(Math.random() * 10000);
      const eventUserInfo = finalizeEvent(
        {
          kind: 0,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: JSON.stringify({
            name: item.name,
            picture: `https://www.larvalabs.com/cryptopunks/cryptopunk${randomNumber.toString().padStart(4, "0")}.png`,
          }),
        },
        userSk,
      );
      await db.collection("events").updateOne(
        {
          kind: 0,
          pubkey: userPubkey,
        },
        {
          $set: {
            id: eventUserInfo.id,
            kind: eventUserInfo.kind,
            content: eventUserInfo.content,
            tags: eventUserInfo.tags,
            sig: eventUserInfo.sig,
            created_at: eventUserInfo.created_at,
          },
        },
        {
          upsert: true,
        },
      );
    }

    const tags = [["e", params.id]];
    const eventComment = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: item.text,
      },
      userSk,
    );
    eventsKind1.push({
      ...eventComment,
      tags_map: convertTagsToDict(tags),
    });
  }
  const result = await db.collection("events").insertMany(eventsKind1);
  return Response.json(result);
};

export { GET, POST };
