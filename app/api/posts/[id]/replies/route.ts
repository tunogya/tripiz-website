import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";
import redis from "@/utils/redis";
import openai from "@/utils/openai";
import {finalizeEvent} from "nostr-tools/pure";
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

// 即时批量生成 AI 评论
const POST = async (req: NextRequest, { params }: { params: { id: string } }) => {
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
    return Response.json({
      error: "Possibly sensitive content",
    }, {
      status: 403,
    });
  }

  let isValid = false;
  const isValidCache = await redis.get(`${pubkey}:${revenuecat_entitlement_id}`);
  if (isValidCache) {
    isValid = true;
  } else {
    const subscriptions = await fetch(`https://api.revenuecat.com/v2/projects/${revenuecat_proj_id}/customers/${pubkey}/subscriptions?environment=production`)
      .then((res) => res.json());

    isValid = subscriptions.items.some((item: any) => {
      return item.gives_access === true
        && item.current_period_ends_at > Date.now()
        && item.entitlements.items.some((e_item: any) => e_item.id === revenuecat_entitlement_id);
    })

    await redis.set(`${pubkey}:${revenuecat_entitlement_id}`, true, {
      ex: 4 * 60 * 60, // 4h
    })
  }

  if (!isValid) {
    return Response.json({
      error: "Subscription not found",
    }, {
      status: 403,
    });
  }

  // 访问OpenAI即时生成评论
  const request = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: ``,
      },
      {
        role: "user",
        content: ``,
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

  const jsonData = JSON.parse(reply);
  const data = jsonData.data;
  // [{name: "", text: ""}]

  let events = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    let sk = generateSecretKey(salt, item.name.toLowerCase()) // `sk` is a Uint8Array
    const event = finalizeEvent({
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["e", params.id],
      ],
      content: item.text,
    }, sk);
    events.push(event);
  }
  const result = await db.collection("events").insertMany(events);
  return Response.json(result)
};

export { GET, POST };
