import mongodbClient from "@/utils/mongodb";
import {NextRequest} from "next/server";

const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id
  await mongodbClient.connect();
  console.log(params.id)
  // const { id } = req.query

  await mongodbClient.close();
  return Response.json({})
}

const DELETE = async (req: NextRequest) => {

}

export {
  GET,
  DELETE
}