import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";
import { ddbDocClient } from "@/utils/ddbDocClient";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const result = await db.collection("events").findOne(
    {
      id: id,
    },
    {
      projection: {
        $vector: 0,
      },
    },
  );

  if (!result) {
    return Response.json({
      error: "Something went wrong",
    });
  }
  return Response.json({
    data: result,
  });
};

const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const id = params.id;
  const { db } = await connectToDatabase();

  const doc = await db.collection("events").findOne({
    id: id,
  });

  try {
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: "events",
        Key: {
          id: id,
        },
        UpdateExpression: "set #deleted_at = :deleted_at",
        ExpressionAttributeNames: {
          "#deleted_at": "deleted_at",
        },
        ExpressionAttributeValues: {
          ":deleted_at": Math.floor(Date.now() / 1000) + 86400 * 30,
        },
      }),
    );
  } catch (e) {
    console.log(e);
  }

  if (!doc) {
    return Response.json({
      error: "404",
    });
  }

  try {
    await db.collection("events").deleteOne({
      id: id,
    });
  } catch (e) {
    console.log(e);
    return Response.json({
      error: "Something went wrong",
    });
  }

  return Response.json({
    deleted: true,
  });
};

export { GET, DELETE };
