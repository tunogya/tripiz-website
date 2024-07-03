import { use, useEffect } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { v4 as uuidv4 } from 'uuid';
import { useIndexedDB } from "react-indexed-db-hook";

const useUserInfo = (pubkey: string) => {
    const { send } = useWebSocket();
    const db = useIndexedDB('ecents');
    
    // 查询indexdb是否有event

    // 发送事件查询最新的userinfo
    useEffect(() => {
        send(JSON.stringify([
            "REQ",
            uuidv4(),
            {
              authors: [pubkey],
              kinds: [0],
              limit: 1,
            },
          ]))
    }, [pubkey]);
}