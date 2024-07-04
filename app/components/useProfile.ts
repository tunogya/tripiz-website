import { db } from "@/utils/db.model";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

const useProfile = (pubkey: string) => {
  const [name, setName] = useState("Anonymous");
  const [picture, setPicture] = useState("");

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
    }
  }, [result]);

  return {
    name,
    picture,
  }

}

export default useProfile