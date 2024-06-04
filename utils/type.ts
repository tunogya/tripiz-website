import { VectorDoc } from "@datastax/astra-db-ts";

// id, kind, pubkey, created_at, content, tags, sig
export interface Event extends VectorDoc {
  id: string;
  kind: number;
  pubkey: string;
  created_at: number;
  content: string;
  tags: [][];
  sig: string;
  category?: string;
  // other fields
  possibly_sensitive?: boolean;
}
