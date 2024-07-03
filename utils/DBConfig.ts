//DBConfig.js|tsx

export const DBConfig = {
    name: "DB",
    version: 1,
    objectStoresMeta: [
      {
        store: "events",
        storeConfig: { keyPath: "id", autoIncrement: false },
        storeSchema: [
          { name: "id", keypath: "id", options: { unique: true } },
          { name: "kind", keypath: "kind", options: { unique: false } },
          { name: "pubkey", keypath: "pubkey", options: { unique: false } },
          { name: "created_at", keypath: "created_at", options: { unique: false } },
          { name: "content", keypath: "content", options: { unique: false } },
          { name: "tags", keypath: "tags", options: { unique: false } },
          { name: "sig", keypath: "sig", options: { unique: false } },
        ],
      },
    ],
  };