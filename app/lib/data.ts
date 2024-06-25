import {connectToDatabase} from "@/utils/astradb";

export const fetchUsers = async () => {
  const { db } = await connectToDatabase();
  return await db.collection("events").find({
    kind: 0,
  }, {
    limit: 20,
  }).toArray();
}