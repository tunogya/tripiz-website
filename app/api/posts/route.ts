import { NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/astradb";
import { verifyEvent } from "nostr-tools/pure";
import snsClient from "@/utils/snsClient";
import { PublishCommand } from "@aws-sdk/client-sns";

const GET = async (req: NextRequest) => {
  const ids =
    req.nextUrl.searchParams
      .get("ids")
      ?.split(",")
      .map((item) => item) || [];

  if (ids.length === 0) {
    return Response.json(
      {
        error: "Missing required fields: ids",
      },
      {
        status: 400,
      },
    );
  }

  const { db } = await connectToDatabase();

  const results = await db
    .collection("events")
    .find({ id: { $in: ids } })
    .toArray();

  if (results) {
    return Response.json({
      data: results,
    });
  } else {
    return Response.json({
      error: "Something went wrong",
    });
  }
};

const POST = async (req: NextRequest) => {
  const { id, kind, pubkey, created_at, content, tags, sig } = await req.json();

  if (kind !== 1) {
    return Response.json(
      {
        error: "kind should be 1",
      },
      {
        status: 400,
      },
    );
  }

  if (content === "") {
    return Response.json(
      {
        error: "content should not be empty",
      },
      {
        status: 400,
      },
    );
  }

  const isValid = verifyEvent({
    id,
    kind,
    pubkey,
    created_at,
    content,
    tags,
    sig,
  });

  if (!isValid) {
    return Response.json(
      {
        error: "Invalid event",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const category =
      tags.find((tag: any[]) => tag[0] === "category")?.[1] || undefined;
    const message = await snsClient.send(
      new PublishCommand({
        TopicArn: process.env.NOSTR_SNS_ARN,
        Message: JSON.stringify({
          id,
          kind,
          pubkey,
          created_at,
          content,
          tags,
          sig,
        }),
        MessageAttributes: {
          kind: {
            DataType: "Number",
            StringValue: kind.toString(),
          },
          ...(category && {
            category: { DataType: "String", StringValue: category },
          }),
        },
      }),
    );
    return Response.json(message);
  } catch (e) {
    return Response.json({
      error: "Something went wrong",
    });
  }
};

export { GET, POST };
