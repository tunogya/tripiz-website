import {ObjectId, VectorDoc} from "@datastax/astra-db-ts";

export interface Post extends VectorDoc {
  _id: ObjectId,
  parent_post_id?: ObjectId,
  user: string,
  text: string,
  flagged?: boolean,
  category: string,
  signature?: string,
  createdAt: Date,
  updatedAt: Date,
}