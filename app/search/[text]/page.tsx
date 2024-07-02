import { useRouter } from "next/router"

const Page = ({params}: {params: {text: string}}) => {
    return (
        <div className="px-6">
            Search {params.text}
        </div>
    )
}

export default Page