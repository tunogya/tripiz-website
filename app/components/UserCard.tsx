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
    <div key={item.id} className={"w-full shrink-0 p-3 group"}>
      <div className={"text-white space-y-2"}>
        {
          picture ? (
            <Image src={picture} alt={""} width={240} height={240} className={"rounded-full group-hover:border-4 border-white hover:cursor-pointer"}/>
          ) : (
            <div className={"w-60 h-60 bg-[#B3B3B3]"}>
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