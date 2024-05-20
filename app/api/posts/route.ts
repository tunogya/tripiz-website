import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";
import {ObjectId} from "@datastax/astra-db-ts";
import {Post} from "@/utils/type";

const GET = async (req: NextRequest) => {
  const ids = req.nextUrl.searchParams.get("ids")?.split(',').map((item) => new ObjectId(item)) || [];
  const { db } = await connectToDatabase();

  const results = await db.collection<Post>("posts").find({ _id: { $in: ids } }).toArray();

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
  const { text, user, category } = await req.json();

  const { db } = await connectToDatabase();

  const result = await db.collection<Post>("posts").insertOne({
    _id: new ObjectId(),
    text,
    user,
    category,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  if (result.insertedId) {
    return Response.json({
      id: result.insertedId.toString(),
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