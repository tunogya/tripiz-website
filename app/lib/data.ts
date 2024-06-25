import {connectToDatabase} from "@/utils/astradb";

export const fetchLatestUsers = async () => {
  const { db } = await connectToDatabase();
  return await db.collection("events").find({
    kind: 0,
  }, {
    sort: {
      created_at: -1,
    },
    limit: 20,
  }).toArray();
}