"use client";
import {useEffect, useState} from "react";
import Image from "next/image";

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
    <div key={item.id} className={"w-[200px]"}>
      <div className={"text-white"}>
        {
          picture ? (
            <Image src={picture} alt={""} width={200} height={200}/>
          ) : (
            <div></div>
          )
        }
        <div className={"text-white"}>{name}</div>
      </div>
    </div>
  )
}

export default UserCard;