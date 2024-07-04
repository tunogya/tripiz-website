'use client';

import { createContext, useContext, useEffect, useRef, useState } from "react";
import useAccount from "./useAccount";
import { db } from "@/utils/db.model";

const WebSocketContext = createContext({
  send: (message: string) => { },
});

// @ts-ignore
const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const { pubkey } = useAccount();

  const url = `wss://relay.abandon.ai?pubkey=${pubkey}`;

  const handleReconnection = () => {
    setTimeout(() => {
      connectWebSocket();
    }, 2_000);
  };

  const connectWebSocket = () => {
    // @ts-ignore
    ws.current = new WebSocket(url);

    // @ts-ignore
    ws.current.onopen = () => {
      setConnected(true);
      console.log("Websocket connected.");
    };

    // @ts-ignore
    ws.current.onclose = (e) => {
      if (connected) {
        setConnected(false);
        handleReconnection();
      }
    };

    // @ts-ignore
    ws.current.onerror = (e) => {
      if (connected) {
        setConnected(false);
        handleReconnection();
      }
    };

    // @ts-ignore
    ws.current.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data?.[0] === "EVENT") {
        const _e = data[2];
        try {
          await db.events.put(_e);
        } catch (e) {
          console.log(e);
        }
      }
    };
  };

  const send = (message: string) => {
    if (ws.current && connected) {
      try {
        // @ts-ignore
        ws.current.send(message);
      } catch (e) {
        // @ts-ignore
        console.log(e)
      }
    }
  };

  useEffect(() => {
    if (pubkey) {
      connectWebSocket();
    }
    // @ts-ignore
    return () => ws.current?.close();
  }, [pubkey]);

  return (
    <WebSocketContext.Provider value={{ send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export { WebSocketProvider, useWebSocket };