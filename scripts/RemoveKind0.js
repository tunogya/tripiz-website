const {DataAPIClient} = require("@datastax/astra-db-ts");
const dotenv = require("dotenv");
dotenv.config();

const astraToken = process.env.ASTRADB_TOKEN;
const astraEndpoint = process.env.ASTRADB_ENDPOINT;

(async() => {
  const client = new DataAPIClient(astraToken);
  const db = client.db(astraEndpoint);
  
  const cursor = await db.collection("events").deleteMany({
    kind: 0,
  });
  console.log(cursor);
})();
