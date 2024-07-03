import { use, useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { v4 as uuidv4 } from 'uuid';
import { useIndexedDB } from "react-indexed-db-hook";

const useUserInfo = (pubkey: string) => {
    const { send } = useWebSocket();
    const { openCursor } = useIndexedDB("events");
    const [event, setEvent] = useState(undefined);
    const [name, setName] = useState("Anonymous");
    const [picture, setPicture] = useState(undefined);

    useEffect(() => {
        const query = async () => {
            if (!pubkey) {
                return 
            }
            openCursor((evt) => {
                // @ts-ignore
                var cursor = evt.target.result;
                if (cursor) {
                    if (cursor.value.kind === 0 && cursor.value.pubkey === pubkey) {
                        setEvent(cursor.value);
                        return;
                    }
                    cursor.continue();
                }
            });
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