import {ObjectId, VectorDoc} from "@datastax/astra-db-ts";

export interface Post extends VectorDoc {
  _id: ObjectId,
  parent_post_id?: ObjectId,
  user: string,
  address?: string,
  text: string,
  possibly_sensitive?: boolean,
  category: string,
  signature?: string,
  created_at: Date,
  updated_at: Date,
}