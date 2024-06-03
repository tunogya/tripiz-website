import {NextRequest} from "next/server";
import {connectToDatabase} from "@/utils/astradb";

const POST = async (req: NextRequest) => {
  const { user, expoPushToken } = await req.json();

  if (!expoPushToken || !user) {
    return Response.json({
      error: "Missing required fields: expoPushToken, user",
    }, {
      status: 400
    })
  }

  const { db } = await connectToDatabase();

  const result = await db.collection("users").updateOne({
    user: user,
  }, {
    $set: {
      expoPushToken,
    }
  }, {
    upsert: true,
  })

  if (result.modifiedCount || result.upsertedCount) {
    return Response.json({
      success: true,
    })
  } else {
    return Response.json({
      error: "Something went wrong",
    })
  }
}

export {
  POST
}