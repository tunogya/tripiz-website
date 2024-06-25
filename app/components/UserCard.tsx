"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import {encodeKey} from "@/app/lib/nostr";

const UserCard = ({item}: any) => {
  const [picture, setPicture] = useState(undefined);
  const [name, setName] = useState(undefined);

  useEffect(() => {
    try {
      const p = JSON.parse(item.content)?.picture;
      const n = JSON.parse(item.content)?.name;
      if (p) {
        setPicture(p);
      }
      if (n) {
        setName(n);
      }
    } catch (e) {
      console.log(e);
    }
  }, [item]);

  return (
    <div key={item.id} className={"w-[200px] shrink-0 py-4"}>
      <div className={"text-white space-y-2"}>
        {
          picture ? (
            <Image src={picture} alt={""} width={200} height={200} className={"rounded-full"}/>
          ) : (
            <div className={"w-50 h-50 bg-[#B3B3B3]"}>
            </div>
          )
        }
        {
          name ? (
            <div>
              <div className={"text-white text-sm"}>{name}</div>
              <div className={"text-[#B3B3B3] text-sm"}>AI</div>
            </div>
          ) : (
            <div>
              <div className={"text-white text-sm truncate"}>{encodeKey("npub", item.pubkey)}</div>
              <div className={"text-[#B3B3B3] text-sm"}>Human</div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default UserCard;