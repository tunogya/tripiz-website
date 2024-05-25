import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {embedding} from "@/utils/embedding";
import redis from "@/utils/redis";
import { createHash } from 'crypto';

const GET = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams.get("query");
  const max_results: number = Number(req.nextUrl.searchParams.get("max_results") || 10);
  const user = req.headers.get("Tripiz-User");
  const signature = req.headers.get("Tripiz-Signature");

  if (!user || !signature) {
    return Response.json({
      error: "Missing required fields: Tripiz-User, Tripiz-Signature"
    }, {
      status: 403
    })
  }

  if (!query) {
    return Response.json({
      error: "Missing required fields: query"
    }, {
      status: 400
    })
  }

  const hash = createHash('sha256').update(`${user}:search:${query}`).digest('hex');

  const cache = await redis.get(hash);

  if (cache) {
    return Response.json({
      data: cache,
      cached: true,
    });
  }

  const { db } = await connectToDatabase();
  const similarPosts = await db.collection("posts").find(
      {
        user: user,
      },
      {
        vector: await embedding(query),
        limit: max_results,
        projection: { $vector: 0 },
      }
    )
    .toArray();

  const data = similarPosts.map((item) => ({
    ...item,
    _id: item._id?.toString()
  }));


  await redis.set(hash, data, {
    ex: 5 * 60 * 60,
  })

  return Response.json({
    data,
    cached: false,
  })
}

export {GET}