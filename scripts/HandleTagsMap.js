const {DataAPIClient} = require("@datastax/astra-db-ts");
const dotenv = require("dotenv");
dotenv.config();

const astraToken = process.env.ASTRADB_TOKEN;
const astraEndpoint = process.env.ASTRADB_ENDPOINT;

const convertTagsToDict = (tags) => {
  const tagsDict = {};
  
  tags.forEach((tag) => {
    if (tag.length === 0) {
      return;
    }
    // @ts-ignore
    const key = tag[0];
    // @ts-ignore
    tagsDict[key] = tag.slice(1);
  });
  
  return tagsDict;
}

(async() => {
  const client = new DataAPIClient(astraToken);
  const db = client.db(astraEndpoint);
  
  const cursor = db.collection("events").find({
    kind: 1,
    tags_map: {
      $exists: false
    }
  });
  
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const tags = doc.tags || [];
    const tags_map = convertTagsToDict(tags);
    
    await db.collection("events").updateOne(
        { _id: doc._id },
        { $set: { tags_map: tags_map } }
    );
    console.log("updated", doc._id);
  }
})();
