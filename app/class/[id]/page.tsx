'use client';
import ContentClassItem from "@/app/components/ContentClassItem";
import useAccount from "@/app/components/useAccount";
import useSWR from "swr";

const Page = ({ params }: { params: { id: string } }) => {
  const { pubkey } = useAccount();
  const { data, isLoading, mutate } = useSWR(
    pubkey
      ? `https://tripiz.abandon.ai/api/accounts/${pubkey}/category?key=${params.id.toLowerCase()}`
      : undefined,
    (url) => fetch(url).then((res) => res.json()),
  );

  return (
    <div className="px-6">
      <div className={"text-white text-6xl font-medium h-40"}>{params.id}</div>
      <div className="space-y-4">
        {isLoading && <div className="text-[#A7A7A7]">Loading...</div>}
        {data &&
          Object.keys(data)
            .sort((a, b) => a.localeCompare(b))
            .map((item) => (
              <ContentClassItem key={item} category={item} value={data[item]} />
            ))}
      </div>
      <div className="h-80"></div>
    </div>
  )
}

export default Page