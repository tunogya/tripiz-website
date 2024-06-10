import { NextRequest } from "next/server";
import { verifyEvent } from "nostr-tools/pure";
import snsClient from "@/utils/snsClient";
import {PublishCommand} from "@aws-sdk/client-sns";

const POST = async (req: NextRequest) => {
  const { id, kind, pubkey, created_at, content, tags, sig } = await req.json();

  if (kind !== 0) {
    return Response.json({
      error: "kind should be 0",
    });
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
    const message = await snsClient.send(new PublishCommand({
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
    }));
    return Response.json(message);
  } catch (e) {
    return Response.json({
      error: "Something went wrong",
    });
  }
};

export { POST };
