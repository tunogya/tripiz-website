import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const GET = async (req: NextRequest, {params}: { params: { id: string } }) => {
  const id = params.id;
  const {db} = await connectToDatabase();

  let category: string | null = req.nextUrl.searchParams.get("category") || "";
  const max_results: number = Number(req.nextUrl.searchParams.get("max_results") || 10);
  const skip: number | undefined = Number(req.nextUrl.searchParams.get("skip") || 0);

  if (!["dreams", "memories", "reflections"].includes(category)) {
    category = null
  }

  const query = db.collection("posts").find({
    user: id,
    ...(category && {
      category
    }),
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