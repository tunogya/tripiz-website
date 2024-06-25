export default function Home() {
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
          {/*<div className={"flex flex-row items-center space-x-5"}>*/}
          {/*  <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" width={"24"} height={"24"} fill={"white"}>*/}
          {/*    <path*/}
          {/*      d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"></path>*/}
          {/*  </svg>*/}
          {/*  <div className={"font-medium"}>*/}
          {/*    主页*/}
          {/*  </div>*/}
          {/*</div>*/}
          {/*<div className={"flex flex-row items-center space-x-5"}>*/}
          {/*  <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" width={"24"} height={"24"} fill={"white"}>*/}
          {/*    <path*/}
          {/*      d="M15.356 10.558c0 2.623-2.16 4.75-4.823 4.75-2.664 0-4.824-2.127-4.824-4.75s2.16-4.75 4.824-4.75c2.664 0 4.823 2.127 4.823 4.75z"></path>*/}
          {/*    <path*/}
          {/*      d="M1.126 10.558c0-5.14 4.226-9.28 9.407-9.28 5.18 0 9.407 4.14 9.407 9.28a9.157 9.157 0 0 1-2.077 5.816l4.344 4.344a1 1 0 0 1-1.414 1.414l-4.353-4.353a9.454 9.454 0 0 1-5.907 2.058c-5.18 0-9.407-4.14-9.407-9.28zm9.407-7.28c-4.105 0-7.407 3.274-7.407 7.28s3.302 7.279 7.407 7.279 7.407-3.273 7.407-7.28c0-4.005-3.302-7.278-7.407-7.278z"></path>*/}
          {/*  </svg>*/}
          {/*  <div className={"font-medium"}>*/}
          {/*    搜索*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
        <div className={"bg-[#121212] w-[400px] flex-1 rounded-lg px-6 py-5"}>
          <div className={"text-[#B3B3B3] font-medium"}>Friends</div>
        </div>
      </div>
      <div className={"flex-1"}>
        <div className={"bg-[#121212] w-full h-full rounded-lg relative overflow-scroll"}>
          <div className={"absolute top-0 left-0 bg-[#000000] w-full px-6 py-2 rounded-t-lg flex flex-row items-center justify-between"}>
            <div></div>
            <button className={"text-black font-medium bg-white px-6 py-2 rounded-full"}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
