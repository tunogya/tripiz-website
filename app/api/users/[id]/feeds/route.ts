import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const GET = async (req: NextRequest, {params}: { params: { id: string } }) => {
  const id = params.id;
  const {db} = await connectToDatabase();

  let max_results: number = Number(req.nextUrl.searchParams.get("max_results") || 10);
  const skip: number | undefined = Number(req.nextUrl.searchParams.get("skip") || 0);

  if (max_results >= 100 || max_results <= 0) {
    return Response.json({
      error: "max_results should > 0 and <= 100",
    }, {
      status: 400,
    })
  }

  const query = db.collection("posts").find({
    user: id,
    "entities.ai": true,
  }, {
    limit: max_results,
    sort: {updatedAt: -1},
    skip: skip,
    projection: {
      $vector: 0
    }
  })

  const results = await query.toArray();

  const hasNext = results.length === max_results;

  if (results) {
    return Response.json({
      data: results.map((item) => ({
        ...item,
        _id: item._id?.toString()
      })),
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