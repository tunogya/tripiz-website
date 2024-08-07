'use client';

import { useState } from "react";
import { db } from "@/utils/db.model";
import useAccount from "../components/useAccount";
import { useLiveQuery } from "dexie-react-hooks";
import PostCard from "../components/PostCard";
import Link from "next/link";

const Page = () => {
  const { pubkey } = useAccount();
  const [filter, setFilter] = useState("");

  const data = useLiveQuery(() => db.events
    .where("kind")
    .equals(1)
    .and((item) => item.pubkey === pubkey)
    .and((item) => {
      if (!filter) return true;
      const category =
        item?.tags?.find((tag: any[]) => tag?.[0] === "category")?.[1] ||
        "reflections";
      return category === filter;
    })
    .limit(20)
    .toArray()
    , [filter, pubkey]);

  return (
    <div className="px-6">
      <div className="space-x-2 py-2 flex flex-row justify-between">
        <div className="space-x-2 py-2 flex flex-row items-center">
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
        <div>
          <Link href={"/create"} prefetch
           className="h-8 w-8 flex items-center justify-center bg-[#FFFFFF12] rounded-full hover:bg-[#FFFFFF24]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        </div>
      </div>
      <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mt-3">
        {
          data && data.map((item) => (
            <PostCard event={item} key={item.id} />
          ))
        }
        {
          data && data?.length === 0 && (
            <div>404</div>
          )
        }
      </div>
      <div className="h-80"></div>
    </div>
  )
}

export default Page;