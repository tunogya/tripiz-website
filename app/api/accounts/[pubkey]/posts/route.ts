import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const GET = async (req: NextRequest, {params}: { params: { pubkey: string } }) => {
  const {db} = await connectToDatabase();

  let category: string | null = req.nextUrl.searchParams.get("category")?.toLowerCase() || "";
  let max_results: number = Number(req.nextUrl.searchParams.get("max_results") || 20);
  const skip: number | undefined = Number(req.nextUrl.searchParams.get("skip") || 0);

  if (!["dreams", "memories", "reflections", ""].includes(category)) {
    return Response.json({
      error: "category should be one of dreams,memories,reflections, or null",
    }, {
      status: 400,
    })
  }

  if (max_results > 20 || max_results <= 0) {
    return Response.json({
      error: "max_results should > 0 and <= 20",
    }, {
      status: 400,
    })
  }

  const query = db.collection("events").find({
    kind: 1,
    pubkey: params.pubkey,
    ...(category && {
      "tags_map.category.0": category,
      // Or use this:
      // "tags_map.category": {
      //   $in: [category],
      // },
    }),
  }, {
    limit: max_results,
    sort: {created_at: -1},
    skip: skip,
    projection: {
      $vector: 0
    }
  })

  const results = await query.toArray();

  const hasNext = results.length === max_results;

  if (results) {
    return Response.json({
      data: results,
      pagination: {
        hasNext,
        nextSkip: hasNext ? skip + results.length : null,
      },
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

export {
  GET
}