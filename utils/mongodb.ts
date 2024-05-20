import { MongoClient, ServerApiVersion, Db } from 'mongodb';
const uri = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null = null;
let cachedCoreDb: Db | null = null;

export async function connectToDatabase() {
  try {
    if (cachedClient && cachedCoreDb) {
      return { client: cachedClient, coreDb: cachedCoreDb };
    }

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    const coreDb = client.db("core");

    cachedClient = client;
    cachedCoreDb = coreDb;

    return { client, coreDb };
  } catch (error) {
    throw new Error('Failed to connect to database');
  }
}