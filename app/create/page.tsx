'use client';
import { useState } from "react";
import { useWebSocket } from "../components/WebSocketProvider";
import { finalizeEvent } from "nostr-tools";
import useAccount from "../components/useAccount";
import { db } from "@/utils/db.model";
import { useRouter } from "next/navigation";

const Page = () => {
  const [filter, setFilter] = useState("memories");
  const [text, setText] = useState("");
  const { send } = useWebSocket();
  const { skHex } = useAccount();
  const router = useRouter();

  const post = () => {
    try {
      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["category", filter.toLowerCase()]],
          content: text,
        },
        Buffer.from(skHex, "hex"),
      );
      db.events.put(event);
      send(JSON.stringify([
        "EVENT",
        event,
      ]));
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="px-6 w-[720px]">
      <div className="py-2 text-2xl">
        Create
      </div>
      <div className="space-x-2 py-2 flex flex-row items-center">
        <button
          onClick={() => setFilter("memories")}
          className={`px-3 py-1.5 rounded-full text-sm ${filter === "memories" ? "bg-white text-black" : "hover:bg-[#FFFFFF24] bg-[#FFFFFF12]"}`}>
          Memories
        </button>
        <button
          onClick={() => setFilter("dreams")}
          className={`px-3 py-1.5 rounded-full text-sm ${filter === "dreams" ? "bg-white text-black" : "hover:bg-[#FFFFFF24] bg-[#FFFFFF12]"}`}>
          Dreams
        </button>
        <button
          onClick={() => setFilter("reflections")}
          className={`px-3 py-1.5 rounded-full text-sm ${filter === "reflections" ? "bg-white text-black" : "hover:bg-[#FFFFFF24] bg-[#FFFFFF12]"}`}>
          Reflections
        </button>
      </div>
      <div className="mt-3 h-[400px]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          style={{
            height: "100%"
          }}
          className="w-full p-3 bg-[#FFFFFF12] rounded-xl outline-none resize-none"
        />
      </div>
      <div className="flex flex-row mt-6 items-center justify-end">
        <button
          disabled={!text}
          onClick={() => {
            post();
            router.push("/library");
          }}
          className="py-3 px-6 bg-[#1DB954] rounded-full text-white font-medium">
          Post
        </button>
      </div>
      <div className="h-80"></div>
    </div>
  )
}

export default Page;