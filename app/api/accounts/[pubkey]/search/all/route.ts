import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";
import { embedding } from "@/utils/embedding";
import redis from "@/utils/redis";
import { createHash } from "crypto";

const GET = async (
  req: NextRequest,
  { params }: { params: { pubkey: string } },
) => {
  const query = req.nextUrl.searchParams.get("query");
  const max_results: number = Number(
    req.nextUrl.searchParams.get("max_results") || 10,
  );

  if (!query) {
    return Response.json(
      {
        error: "Missing required fields: query",
      },
      {
        status: 400,
      },
    );
  }

  const hash = createHash("sha256")
    .update(`${params.pubkey}:search:${query}`)
    .digest("hex");

  const cache = await redis.get(hash);

  if (cache) {
    return Response.json({
      data: cache,
      cached: true,
    });
  }

  const { db } = await connectToDatabase();
  const similarPosts = await db
    .collection("events")
    .find(
      {
        kind: 1,
        pubkey: params.pubkey,
      },
      {
        vector: await embedding(query),
        limit: max_results,
        projection: {
          sig: 0,
          $vector: 0,
        },
      },
    )
    .toArray();

  await redis.set(hash, similarPosts, {
    ex: 5 * 60 * 60,
  });

  return Response.json({
    data: similarPosts,
    cached: false,
  });
};

export { GET };
