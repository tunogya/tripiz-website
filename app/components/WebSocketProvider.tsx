import { hexToBytes } from "@noble/hashes/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { getPublicKey } from "nostr-tools";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const WebSocketContext = createContext({
  send: (message: string) => {},
});

// @ts-ignore
const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [queue, setQueue] = useState([]);
  const [skHex, setSkHex] = useLocalStorage("skHex", "");

  const pubkey = useMemo(() => {
    const sk = hexToBytes(skHex);
    return getPublicKey(sk);
  }, [skHex]);

  // const pubkey = useLocalStorage("pubkey", generateSecretKey());
  const url = `wss://relay.abandon.ai?pubkey=${pubkey}`;

  const handleReconnection = () => {
    if (connected) {
      return
    }
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
      setConnected(false);
      handleReconnection();
    };

    // @ts-ignore
    ws.current.onerror = (e) => {
      setConnected(false);
    };

    // @ts-ignore
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data?.[0] === "EVENT") {
        const _e = data[2];
        try {
          // insert into db
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
        setQueue([...queue, message]);
      }
    } else {
      // @ts-ignore
      setQueue([...queue, message]);
    }
  };

  useEffect(() => {
    if (queue.length > 0 && connected) {
      const e = queue[0];
      try {
        // @ts-ignore
        ws.current.send(e);
        setQueue((prevQueue) => prevQueue.slice(1)); // Remove the sent message
      } catch (e) {
        console.log(e);
      }
    }
  }, [queue, connected]);

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
