import {NextRequest} from "next/server";
import mongodbClient from "../../../utils/mongodb";

const GET = async (req: NextRequest) => {
  return new Response("Hello, Next.js!")
}

const POST = async (req: NextRequest) => {
  const { title, content, author } = await req.json();

  await mongodbClient.connect();
  const result = await mongodbClient.db("core").collection("posts").insertOne({
    title,
    content,
    author,
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
    }, {
      status: 500
    })
  }
}

export {
  GET,
  POST
}