import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";
import redis from "@/utils/redis";

const GET = async (
  req: NextRequest,
  { params }: { params: { pubkey: string } },
) => {
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return Response.json(
      {
        error: "Missing required fields: key",
      },
      {
        status: 400,
      },
    );
  }

  const cache = await redis.get(`category:${key}:${params.pubkey}`);

  if (cache) {
    return Response.json(cache);
  }

  const { db } = await connectToDatabase();

  const result = await db.collection("contents").find(
    {
      pubkey: params.pubkey,
      key: key,
    },
  ).toArray();

  // 将相同的value归集为一组
  const grouped = result.reduce((acc, cur) => {
    // @ts-ignore
    if (acc[cur.value]) {
      // @ts-ignore
      acc[cur.value].push(cur.id);
    } else {
      // @ts-ignore
      acc[cur.value] = [cur.id];
    }
    return acc;
  }, {});

  await redis.set(`category:${key}:${params.pubkey}`, JSON.stringify(grouped), {
    ex: 60,
  });

  return Response.json(grouped);
};

export { GET };
