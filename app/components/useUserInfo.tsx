import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { v4 as uuidv4 } from 'uuid';
import { useIndexedDB } from "react-indexed-db-hook";

const useUserInfo = (pubkey: string) => {
    const { send } = useWebSocket();
    const { openCursor, deleteRecord } = useIndexedDB("events");
    const [event, setEvent] = useState<any>(undefined);
    const [name, setName] = useState("Anonymous");
    const [picture, setPicture] = useState(undefined);

    useEffect(() => {
        const query = async () => {
            if (!pubkey) {
                return 
            }
            const results: any[] = [];

            const openCursorAsync = () => {
                return new Promise((resolve, reject) => {
                    openCursor((evt) => {
                        // @ts-ignore
                        var cursor = evt.target.result;
                        if (cursor) {
                            if (cursor.value.kind === 0 && cursor.value.pubkey === pubkey) {
                                results.push(cursor.value);
                            }
                            cursor.continue();
                        } else {
                            resolve(results); // 当游标遍历完毕时，解析 Promise
                        }
                    });
                });
            };

            await openCursorAsync();

            if (results.length > 0) {
                const sortedResults = results.sort((a, b) => b.created_at - a.created_at);
                setEvent(sortedResults[0]);

                if (sortedResults.length > 1) {
                    const needToDelete = sortedResults.slice(1);
                    needToDelete.forEach((item) => {
                        deleteRecord(item.id);
                    });
                }
            }
        }
        query();
    }, []);

    useEffect(() => {
        try {
            // @ts-ignore
            const info = JSON.parse(event?.content);
            setName(info?.name);
            setPicture(info?.picture);
        } catch (e) {
            console.log(e);
        }
    }, [event]);

    useEffect(() => {
        if (!pubkey) {
            return
        }
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

    return {
        name,
        picture
    }
}

export default useUserInfo;