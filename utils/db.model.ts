import Dexie, { Table } from 'dexie';

// table inteface
export interface Event {
  id: string;
  kind: number;
  pubkey: string;
  created_at: number;
  content: string;
  tags: string[][];
  sig: string;
}

export class DB extends Dexie {
  events!: Table<Event>; 
  constructor() {
    super('DB');
    this.version(1).stores({
        events: '&id, *kind, *pubkey, created_at, content, tags, sig',  
    });
  }
}

export const db = new DB(); // export the db