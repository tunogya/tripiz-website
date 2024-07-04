'use client';
import ContentClassItem from "@/app/components/ContentClassItem";
import useAccount from "@/app/components/useAccount";
import useSWR from "swr";

const Page = ({ params }: { params: { id: string } }) => {
  const { pubkey } = useAccount();
  const { data, isLoading, mutate } = useSWR(
    pubkey
      ? `http://localhost:3000/api/accounts/${pubkey}/category?key=${params.id.toLowerCase()}`
      : undefined,
    (url) => fetch(url).then((res) => res.json()),
  );

  return (
    <div>
      <div className={"text-white text-6xl font-medium px-6 pb-6"}>{params.id}</div>
      <div className="space-y-4">
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