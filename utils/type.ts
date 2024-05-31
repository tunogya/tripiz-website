import {ObjectId, VectorDoc} from "@datastax/astra-db-ts";

export interface Post extends VectorDoc {
  _id: ObjectId,
  parent_post_id?: ObjectId,
  user: string,
  text: string,
  flagged?: boolean,
  category: string,
  entities: {
    ai?: boolean,
    media?: {
      id: string,
      url: string,
      media_url: string,
      media_url_https: string,
      type: string,
    }[],
  },
  createdAt: Date,
  updatedAt: Date,
}