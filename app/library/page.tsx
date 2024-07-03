'use client';
import { v4 as uuidv4 } from 'uuid';
import { hexToBytes } from "@noble/hashes/utils";
import { useLocalStorage } from "@uidotdev/usehooks";
import { getPublicKey } from "nostr-tools";
import { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "../components/WebSocketProvider";
import { useIndexedDB } from 'react-indexed-db-hook';
import PostCard from '../components/PostCard';

const Page = () => {
  const [skHex, setSkHex] = useLocalStorage("skHex", "");
  const { openCursor } = useIndexedDB("events");
  const { send } = useWebSocket();
  const [filter, setFilter] = useState("");
  const [DATA, setDATA] = useState<any[]>([]);

  const pubkey = useMemo(() => {
    const sk = hexToBytes(skHex);
    return getPublicKey(sk);
  }, [skHex]);

  useEffect(() => {
    const query = async () => {
      let result: any[] = [];
      const openCursorAsync = () => {
        return new Promise((resolve, reject) => {
          openCursor((evt) => {
            // @ts-ignore
            var cursor = evt.target.result;
            if (cursor) {
              if (cursor.value.kind === 1 && cursor.value.pubkey === pubkey) {
                result.push(cursor.value);
              }
              cursor.continue();
            } else {
              resolve(result); // 当游标遍历完毕时，解析 Promise
            }
          });
        });
      };

      await openCursorAsync();

      // 将results排序，created_at 降序
      result = result.sort((a, b) => b.created_at - a.created_at);
      setDATA(result);
    }
    query();
  }, []);

  const filterData = useMemo(() => {
    if (filter) {
      return DATA.filter((item) => {
        const category =
          item?.tags?.find((tag: any[]) => tag?.[0] === "category")?.[1] ||
          "reflections";
        return category === filter;
      });
    } else {
      return DATA;
    }
  }, [DATA, filter]);

  // useEffect(() => {
  //   send(JSON.stringify([
  //     "REQ",
  //     uuidv4(),
  //     {
  //       authors: [pubkey],
  //       kinds: [1],
  //       limit: 20,
  //     },
  //   ]));
  // }, [pubkey]);

  return (
    <div className="px-6">
      <div className="space-x-2 py-2 flex flex-row">
        {
          filter !== "" && (
            <button
              onClick={() => setFilter("")}
              className='h-8 w-8 flex items-center justify-center bg-[#FFFFFF12] rounded-full hover:bg-[#FFFFFF24]'>
              <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill='white'><path d="M2.47 2.47a.75.75 0 0 1 1.06 0L8 6.94l4.47-4.47a.75.75 0 1 1 1.06 1.06L9.06 8l4.47 4.47a.75.75 0 1 1-1.06 1.06L8 9.06l-4.47 4.47a.75.75 0 0 1-1.06-1.06L6.94 8 2.47 3.53a.75.75 0 0 1 0-1.06Z"></path></svg>
            </button>
          )
        }
        {
          (filter === "" || filter === "memories") && (
            <button
              onClick={() => setFilter("memories")}
              className={`px-3 py-1.5 rounded-full text-sm ${filter === "memories" ? "bg-white text-black" : "hover:bg-[#FFFFFF24] bg-[#FFFFFF12]"}`}>
              Memories
            </button>
          )
        }
        {
          (filter === "" || filter === "dreams") && (
            <button
              onClick={() => setFilter("dreams")}
              className={`px-3 py-1.5 rounded-full text-sm ${filter === "dreams" ? "bg-white text-black" : "hover:bg-[#FFFFFF24] bg-[#FFFFFF12]"}`}>
              Dreams
            </button>
          )
        }
        {
          (filter === "" || filter === "reflections") && (
            <button
              onClick={() => setFilter("reflections")}
              className={`px-3 py-1.5 rounded-full text-sm ${filter === "reflections" ? "bg-white text-black" : "hover:bg-[#FFFFFF24] bg-[#FFFFFF12]"}`}>
              Reflections
            </button>
          )
        }
      </div>
      <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mt-3">
        {
          filterData.map((item) => (
            <PostCard event={item} key={item.id} />
          ))
        }
      </div>
    </div>
  )
}

export default Page