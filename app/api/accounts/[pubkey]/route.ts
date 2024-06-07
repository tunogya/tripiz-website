import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";

const GET = async (
  req: NextRequest,
  { params }: { params: { pubkey: string } },
) => {
  const { db } = await connectToDatabase();

  const result = await db
    .collection("events")
    .findOne(
      {
        kind: 0,
        pubkey: params.pubkey,
      },
      {
        projection: {
          $vector: 0,
        },
      },
    );

  if (result && result?.content) {
    try {
      const data = JSON.parse(result.content);
      return Response.json(data);
    } catch (e) {
      return Response.json({
        error: "Content is not json",
      });
    }
  } else {
    return Response.json({
      error: "404",
    }, {
      status: 404,
    });
  }
};

export { GET };
