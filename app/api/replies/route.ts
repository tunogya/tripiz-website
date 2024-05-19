import {NextRequest} from "next/server";

const GET = async (req: NextRequest) => {
  return new Response("Hello, Next.js!")
}

const POST = async (req: NextRequest) => {
  return new Response("Hello, Next.js!")
}

export {
  GET,
  POST
}