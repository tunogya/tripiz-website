import { FC } from "react"

const NavigationBar: FC<{
    scrolled: boolean
}> = ({scrolled}) => {
    return (
        <div
        className={`sticky top-0 h-[64px] ${scrolled ? "bg-[#121212]" : "bg-[#00000033]"} rounded-t-lg flex flex-row items-center justify-between pl-4 pr-8`}>
        <div className="flex flex-row space-x-2">
          <button className="h-8 w-8 rounded-full bg-[#000000B3] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button className="h-8 w-8 rounded-full bg-[#000000B3] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
        <button className={"text-black font-medium bg-white h-[48px] py-2 px-8 rounded-full"}>
          Login
        </button>
      </div>
    )
}

export default NavigationBar