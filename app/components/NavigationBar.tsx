'use client';

import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import useAccount from "./useAccount";

const NavigationBar: FC<{
  scrolled: boolean
}> = ({ scrolled }) => {
  const [text, setText] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { skHex } = useAccount();

  // const { picture } = useUserInfo(pubkey);

  useEffect(() => {
    if (!pathname.startsWith("/search")) {
      setText("");
    }
  }, [pathname]);

  return (
    <div
      className={`sticky top-0 h-[64px] ${scrolled ? "bg-[#121212]" : "bg-[#00000033]"} rounded-t-lg flex flex-row items-center justify-between px-4`}>
      <div className="flex flex-row items-center space-x-4">
        <div className="flex flex-row space-x-2">
          <button
            onClick={() => {
              router.back();
            }}
            className="h-8 w-8 rounded-full bg-[#000000B3] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => {
              router.forward();
            }}
            className="h-8 w-8 rounded-full bg-[#000000B3] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
        {
          pathname?.startsWith("/search") && (
            <div
              className="h-[48px] xl:w-[365px] w-[300px] rounded-full bg-[#242424] text-white px-4 flex items-center space-x-3"
            >
              <svg data-encore-id="icon" role="img" aria-hidden="true" width={16} height={16} fill="white" viewBox="0 0 16 16"><path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z"></path></svg>
              <input
                className="text-white outline-none bg-transparent h-full w-full"
                type="text"
                placeholder="Search..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  router.replace(`/search/${e.target.value}`)
                }}
              />
            </div>
          )
        }
      </div>
      <div className="flex flex-row items-center space-x-4">
        <a
          href="https://www.abandon.ai/blog/2024/06/29/" target="_blank"
          className="text-white text-sm hover:scale-105 py-1 px-4 flex flex-row items-center space-x-1">
          <svg data-encore-id="icon" fill="white" width={16} height={16} role="img" aria-hidden="true" viewBox="0 0 16 16"><path d="M4.995 8.745a.75.75 0 0 1 1.06 0L7.25 9.939V4a.75.75 0 0 1 1.5 0v5.94l1.195-1.195a.75.75 0 1 1 1.06 1.06L8 12.811l-.528-.528a.945.945 0 0 1-.005-.005L4.995 9.805a.75.75 0 0 1 0-1.06z"></path><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z"></path></svg>
          <div>Install App</div>
        </a>
        <div className="pr-2">
          <Link href={"/account"} prefetch
            className="w-8 h-8 flex items-center justify-center hover:scale-105">
            {/* {
              picture ? (
                <Image src={picture} alt={""} width={24} height={24} className="rounded-full" />
              ) : (
                <div className="w-6 h-6 bg-red-500 rounded-full">
                </div>
              )
            } */}
                 <div className="w-6 h-6 bg-red-500 rounded-full">
                 </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NavigationBar