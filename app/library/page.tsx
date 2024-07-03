'use client';
import { v4 as uuidv4 } from 'uuid';
import { hexToBytes } from "@noble/hashes/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { getPublicKey } from "nostr-tools";
import { useEffect, useMemo } from "react";
import { useWebSocket } from "../components/WebSocketProvider";

const Page = () => {
    const [skHex, setSkHex] = useLocalStorage("skHex", "");
    const { send } = useWebSocket();

    const pubkey = useMemo(() => {
        const sk = hexToBytes(skHex);
        return getPublicKey(sk);
    }, [skHex]);

    useEffect(() => {
        send(JSON.stringify([
            "REQ",
            uuidv4(),
            {
                authors: [pubkey],
                kinds: [1],
                limit: 20,
            },
        ]));
    }, [pubkey]);

    return (
        <div className="px-6">
            <div className="space-x-2 py-2">
                <button className="px-3 py-1.5 bg-[#FFFFFF12] rounded-full text-sm">
                    Memories
                </button>
                <button className="px-3 py-1.5 bg-[#FFFFFF12] rounded-full text-sm">
                    Dreams
                </button>
                <button className="px-3 py-1.5 bg-[#FFFFFF12] rounded-full text-sm">
                    Reflections
                </button>
            </div>
            <div>
            </div>
        </div>
    )
}

export default Page