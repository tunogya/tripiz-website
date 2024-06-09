import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";
import redis from "@/utils/redis";
import openai from "@/utils/openai";
import {finalizeEvent, getPublicKey} from "nostr-tools/pure";
import {generateSecretKey} from "@/utils/generateSecretKey";

const revenuecat_proj_id = process.env.REVENUECAT_PROJECT_ID;
const revenuecat_entitlement_id = process.env.REVENUECAT_ENTITLEMENT_ID;
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

  const hasNext = results.length === max_results;

  if (!results) {
    return Response.json({
      error: "Something went wrong",
    });
  }
  return Response.json({
    data: results,
    pagination: {
      hasNext,
      nextSkip: hasNext ? skip + results.length : null,
    },
  });
};

const POST = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const isWorking = await redis.get(`working:${params.id}`);
  if (isWorking) {
    return Response.json({
      error: "Already working",
    }, {
      status: 403,
    });
  }
  await redis.set(`working:${params.id}`, true, {
    ex: 5 * 60,
  });
  const { db } = await connectToDatabase();
  const post = await db.collection("events").findOne({
    id: params.id,
  });
  if (!post) {
    return Response.json({
      error: "404",
    }, {
      status: 404,
    });
  }
  const pubkey = post.pubkey;
  const possibly_sensitive = post.possibly_sensitive || false;

  if (possibly_sensitive) {
    await redis.del(`working:${params.id}`).catch((e) => console.log(e));
    return Response.json({
      error: "Possibly sensitive content",
    }, {
      status: 403,
    });
  }
  //
  // let isValid = await redis.get(`${pubkey}:${revenuecat_entitlement_id}`);
  //
  // if (!isValid) {
  //   try {
  //     const subscriptions = await fetch(`https://api.revenuecat.com/v2/projects/${revenuecat_proj_id}/customers/${pubkey}/subscriptions?environment=production`)
  //       .then((res) => res.json());
  //
  //     isValid = subscriptions.items.some((item: any) => {
  //       return item.gives_access === true
  //         && item.current_period_ends_at > Date.now()
  //         && item.entitlements.items.some((e_item: any) => e_item.id === revenuecat_entitlement_id);
  //     })
  //     await redis.set(`${pubkey}:${revenuecat_entitlement_id}`, true, {
  //       ex: 4 * 60 * 60, // 4h
  //     })
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  // if (!isValid) {
  //   await redis.del(`working:${params.id}`).catch((e) => console.log(e));
  //   return Response.json({
  //     error: "Subscription not found",
  //   }, {
  //     status: 403,
  //   });
  // }

  const request = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `#### User Requirement Description: 

The user will write a reflection, with the theme being their memories, dreams, or thoughts. Your task is:

1. Find multiple pieces of text from human civilization's history that closely match the user's reflection and can evoke an emotional resonance.
2. These texts can be real quotes from a historical figure or words spoken by a character in a book.
3. Ensure that the texts are authentic and not fictional.

#### Return Format: 

If you find suitable texts, return a JSON array where each element contains the following fields:

- \`"name"\`: The author of the text or the character who said it.
- \`"text"\`: The text that resonates with the user's reflection.

For example:
\`\`\`json
{"data": ["name":"Li Bai","text":"Heaven has endowed me with talents, and they will be put to good use. Wealth may be scattered, but it will return."},{"name":"Marcus Aurelius","text":"The happiness of your life depends upon the quality of your thoughts."}]}
\`\`\`

If no suitable texts are found, return an empty array.`,
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
    await redis.del(`working:${params.id}`).catch((e) => console.log(e));
    return Response.json({
      error: "Something went wrong",
    });
  }

  const data = JSON.parse(reply)?.data || [];

  let eventsKind1 = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    let userSk = generateSecretKey(salt, item.name.toLowerCase()) // `sk` is a Uint8Array
    const userPubkey = getPublicKey(userSk);
    const randomNumber = Math.floor(Math.random() * 10000);
    const eventUserInfo = finalizeEvent({
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({
        name: item.name,
        picture: `https://www.larvalabs.com/cryptopunks/cryptopunk${randomNumber.toString().padStart(4, "0")}.png`,
      }),
    }, userSk);
    await db.collection("events").updateOne({
      kind: 0,
      pubkey: userPubkey,
    }, {
      $set: {
        id: eventUserInfo.id,
        kind: eventUserInfo.kind,
        content: eventUserInfo.content,
        tags: eventUserInfo.tags,
        sig: eventUserInfo.sig,
        created_at: eventUserInfo.created_at,
      },
    }, {
      upsert: true,
    });
    const eventComment = finalizeEvent({
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["e", params.id],
      ],
      content: item.text,
    }, userSk);
    eventsKind1.push({
      ...eventComment,
      tags_map: {
        e: [params.id],
      },
    });
  }
  await redis.del(`working:${params.id}`).catch((e) => console.log(e));
  const result = await db.collection("events").insertMany(eventsKind1);
  return Response.json(result);
};

export { GET, POST };
