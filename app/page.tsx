import {fetchLatestUsers} from "@/app/lib/data";
import UserCard from "@/app/components/UserCard";

export default async function Home() {
  const users = await fetchLatestUsers();

  return (
    <div className={"flex flex-row p-2 h-screen w-screen overflow-hidden space-x-2"}>
      <div className={"space-y-2 flex flex-col"}>
        <div className={"bg-[#121212] w-[400px] rounded-lg px-6 py-5 space-y-5"}>
          <div className={"flex flex-row items-center space-x-1"}>
            <svg width="24" height="24" viewBox="0 0 760 696" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M264.688 694.445H117.185C-41.7065 554.104 -95.9871 84.379 328.62 4.25391C676.281 -42.873 853.423 311.965 710.104 554.104C677.442 614.825 578.992 705.709 424.166 694.445C319.554 681.009 242.827 653.118 174.492 521.263C80.5192 307.391 232.027 167.009 347.798 151.871C467.056 136.278 513.886 185.238 542.956 207.93C654.037 294.638 631.296 554.104 452.292 554.104C370.484 547.927 328.327 512.5 308.5 475C285 430.554 285.5 371.5 311.184 332.677C339.373 297.661 394.5 270 446.5 322.5C474.728 351 459.944 405.429 430.673 424.852C449.62 440.523 485.27 429.392 504.716 402.06C515.389 388.103 522.363 344.095 504.716 311.964C496.5 288.747 454.733 234.581 369.768 244.046C284.802 253.511 233.181 341.529 242.838 424.852C260.622 517.105 328.62 609.626 474.728 599.577C618.848 575.93 678.4 440.524 662.333 332.677C644.689 214.246 555.28 111.329 409.52 96.775C289.131 88.5898 175.07 157.763 126.022 257.561C79.6434 364.982 88.1547 458.016 126.022 538.935C165.425 623.14 217.896 668.733 264.688 694.445Z"
                fill="white"/>
            </svg>
            <div className={"font-medium"}>
              Tripiz
            </div>
          </div>
        </div>
        <div className={"bg-[#121212] w-[400px] flex-1 rounded-lg px-6 py-5"}>
          <div className={"text-[#B3B3B3] font-medium"}>Friends</div>
        </div>
      </div>
      <div className={"w-[calc(100%-412px)]"}>
        <div className={"bg-[#121212] h-full rounded-lg"}>
          <div
            className={"sticky top-0 bg-[#000000] px-6 py-2 rounded-t-lg flex flex-row items-center justify-between"}>
            <div></div>
            <button className={"text-black font-medium bg-white px-6 py-2 rounded-full"}>
              Login
            </button>
          </div>
          <div className={"py-5 space-y-3"}>
            <div className={"text-[#B3B3B3] font-medium px-6"}>Latest Users</div>
            <div className={"flex-1 overflow-auto"}>
              <div className={"flex flex-row space-x-3"}>
                <div className={"w-6"}></div>
                {
                  users.map((item) => (
                    <UserCard item={item} key={item.id}/>
                  ))
                }
                <div className={"w-6"}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}