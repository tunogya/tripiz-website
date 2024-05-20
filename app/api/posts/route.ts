import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/mongodb";
import {ObjectId} from "mongodb";

const GET = async (req: NextRequest) => {
  const ids = req.nextUrl.searchParams.get("ids")?.split(',').map((item) => new ObjectId(item)) || [];
  const { coreDb } = await connectToDatabase();

  const results = await coreDb.collection("posts").find({ _id: { $in: ids } }).toArray();

  if (results) {
    return Response.json({
      data: results
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

const POST = async (req: NextRequest) => {
  const { title, content, author, category } = await req.json();

  const { coreDb } = await connectToDatabase();

  const result = await coreDb.collection("posts").insertOne({
    title,
    content,
    author,
    category,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  if (result.acknowledged) {
    return Response.json({
      id: result.insertedId.id,
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

export {
  GET,
  POST
}