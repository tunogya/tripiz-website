'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect, useRef, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    const handleScroll = () => {
      // @ts-ignore
      if (scrollRef.current?.scrollTop > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    // @ts-ignore
    scrollRef.current?.addEventListener('scroll', handleScroll);

    // 清理事件监听器
    return () => {
      // @ts-ignore
      scrollRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={"flex flex-row h-screen w-screen p-2 space-x-2"}>
          <div className={"space-y-2 flex flex-col w-[400px]"}>
            <div className={"bg-[#121212] w-full rounded-lg px-6 py-5 space-y-5"}>
              <div className={"flex flex-row items-center space-x-1"}>
                <svg width="24" height="24" viewBox="0 0 760 696" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M264.688 694.445H117.185C-41.7065 554.104 -95.9871 84.379 328.62 4.25391C676.281 -42.873 853.423 311.965 710.104 554.104C677.442 614.825 578.992 705.709 424.166 694.445C319.554 681.009 242.827 653.118 174.492 521.263C80.5192 307.391 232.027 167.009 347.798 151.871C467.056 136.278 513.886 185.238 542.956 207.93C654.037 294.638 631.296 554.104 452.292 554.104C370.484 547.927 328.327 512.5 308.5 475C285 430.554 285.5 371.5 311.184 332.677C339.373 297.661 394.5 270 446.5 322.5C474.728 351 459.944 405.429 430.673 424.852C449.62 440.523 485.27 429.392 504.716 402.06C515.389 388.103 522.363 344.095 504.716 311.964C496.5 288.747 454.733 234.581 369.768 244.046C284.802 253.511 233.181 341.529 242.838 424.852C260.622 517.105 328.62 609.626 474.728 599.577C618.848 575.93 678.4 440.524 662.333 332.677C644.689 214.246 555.28 111.329 409.52 96.775C289.131 88.5898 175.07 157.763 126.022 257.561C79.6434 364.982 88.1547 458.016 126.022 538.935C165.425 623.14 217.896 668.733 264.688 694.445Z"
                    fill="white" />
                </svg>
                <div className={"font-medium"}>
                  Tripiz
                </div>
              </div>
            </div>
            <div className={"bg-[#121212] w-full flex-1 rounded-lg px-6 py-5"}>
              <div className={"text-[#B3B3B3] font-medium"}>Friends</div>
            </div>
          </div>
          <div className={"w-[calc(100%-408px)] overflow-y-scroll"}>
            <div className={"rounded-lg bg-[#121212] h-full overflow-scroll"} ref={scrollRef}>
              <div
                className={`sticky top-0 h-[64px] ${scrolled ? "bg-[#121212]" : "bg-[#00000033]"} rounded-t-lg flex flex-row items-center justify-between pl-4 pr-8`}>
                <div className="flex flex-row space-x-2">
                  <button className="h-8 w-8 rounded-full bg-[#000000B3] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button className="h-8 w-8 rounded-full bg-[#000000B3] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
                <button className={"text-black font-medium bg-white h-[48px] py-2 px-8 rounded-full"}>
                  Login
                </button>
              </div>
              <div className={"py-5 space-y-3"}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
