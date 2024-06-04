import {
  DataAPIClient,
  VectorDoc,
  UUID,
  ObjectId,
} from "@datastax/astra-db-ts";

// Schema for the collection (VectorDoc adds the $vector field)
interface Idea extends VectorDoc {
  idea: string;
}

// Connect to the db
const client = new DataAPIClient("*TOKEN*");
const db = client.db("*ENDPOINT*", { namespace: "*NAMESPACE*" });

(async () => {
  try {
    // Creates collection, or gets it if it already exists with same options
    const collection = await db.createCollection<Idea>("vector_5_collection", {
      vector: {
        dimension: 5,
        metric: "cosine",
      },
      checkExists: false,
    });

    // Insert many ideas into the collection
    const ideas = [
      {
        idea: "An AI quilt to help you sleep forever",
        $vector: [0.1, 0.15, 0.3, 0.12, 0.05],
      },
      {
        _id: new UUID("e7f1f3a0-7e3d-11eb-9439-0242ac130002"),
        idea: "Vision Vector Frame—A deep learning display that controls your mood",
        $vector: [0.1, 0.05, 0.08, 0.3, 0.6],
      },
      {
        idea: "A smartwatch that tells you what to eat based on your mood",
        $vector: [0.2, 0.3, 0.1, 0.4, 0.15],
      },
    ];
    await collection.insertMany(ideas);

    // Insert a specific idea into the collection
    const sneakersIdea = {
      _id: new ObjectId("507f191e810c19729de860ea"),
      idea: "ChatGPT-integrated sneakers that talk to you",
      $vector: [0.45, 0.09, 0.01, 0.2, 0.11],
    };
    await collection.insertOne(sneakersIdea);

    // Actually, let's change that idea
    await collection.updateOne(
      { _id: sneakersIdea._id },
      { $set: { idea: "Gemini-integrated sneakers that talk to you" } },
    );

    // Get similar results as desire
    const cursor = collection.find(
      {},
      {
        vector: [0.1, 0.15, 0.3, 0.12, 0.05],
        includeSimilarity: true,
        limit: 2,
      },
    );

    for await (const doc of cursor) {
      // Prints the following:
      // - An AI quilt to help you sleep forever: 1
      // - A smartwatch that tells you what to eat based on your mood: 0.85490346
      console.log(`${doc.idea}: ${doc.$similarity}`);
    }

    // Cleanup (if desired)
    await collection.drop();
  } finally {
    // Cleans up all open http sessions
    await client.close();
  }
})();
