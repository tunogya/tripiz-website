import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;

  let max_results: number = Number(req.nextUrl.searchParams.get("max_results") || 20);
  const skip: number | undefined = Number(req.nextUrl.searchParams.get("skip") || 0);

  if (max_results > 20 || max_results <= 0) {
    return Response.json({
      error: "max_results should > 0 and <= 20",
    }, {
      status: 400,
    })
  }

  const { db } = await connectToDatabase();

  const result = db.collection("events").find({
    kind: 1,
    tags: {
      $elemMatch: { $eq: ["e", id] }
    },
  }, {
    limit: max_results,
    sort: {created_at: -1},
    skip: skip,
    projection: {
      $vector: 0,
    }
  })

  if (!result) {
    return Response.json({
      error: "Something went wrong",
    })
  }
  return Response.json({
    data: result
  })
}

export {GET}