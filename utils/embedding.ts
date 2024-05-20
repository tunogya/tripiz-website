export async function embedding(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
    },
    body: JSON.stringify({
      input: prompt,
      model: "text-embedding-3-small",
    }),
  });

  const result = await response.json();

  return result.data[0].embedding;
}

/**
 * const movies = database.collection('movies');
 * const similarMovies = await movies
 *   .find(
 *     {},
 *     {
 *       // Provide embedding vector based on the prompt.
 *       vector: await embedding("Criminals and detectives"),
 *       // Limit to three top results.
 *       limit: 3,
 *       // Do not include vectors in the output.
 *       projection: { $vector: 0 },
 *     }
 *   )
 *   .toArray();
 */