'use client';

import { db } from "@/utils/db.model";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { v4 as uuidv4 } from 'uuid';

const useProfile = (pubkey: string) => {
  const [name, setName] = useState("Anonymous");
  const [picture, setPicture] = useState("");
  const { send } = useWebSocket();

  const result = useLiveQuery(() => db.events
    .where("pubkey")
    .equals(pubkey || "")
    .and((event) => event.kind === 0)
    .sortBy("created_at") // order by created_at desc
    ,[pubkey],
  );

  useEffect(() => {
    if (result) {
      try {
        const content = JSON.parse(result[0].content);
        setName(content?.name || "Anonymous");
        setPicture(content?.picture || "");
      } catch(e) {
        console.log(e);
      }
    } else {
      send(JSON.stringify([
        "REQ",
        uuidv4(),
        {
          kinds: [0],
          authors: [pubkey],
          limit: 1,
        }
      ]));
    }
  }, [result]);

  return {
    name,
    picture,
  }

}

export default useProfile