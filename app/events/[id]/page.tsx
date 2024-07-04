'use client';
import { useWebSocket } from "@/app/components/WebSocketProvider";
import { db } from "@/utils/db.model";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const Page = ({ params }: { params: { id: string } }) => {
  const { send } = useWebSocket();
  const event = useLiveQuery(() => db.events
    .where("id")
    .equals(params.id)
    .first(), [params.id]
  )

  const category =
    event?.tags?.find((tag: any[]) => tag?.[0] === "category")?.[1] ||
    "reflections";

  useEffect(() => {
    if (!event) {
      send(JSON.stringify([
        "REQ",
        uuidv4(),
        {
          ids: [params.id],
          kinds: [1],
          limit: 1,
        }
      ]));
    }
  }, [event]);

  return (
    <div className="flex flex-row px-6 h-[800px] space-x-6">
      <div className="space-y-6 w-[720px]">
        <div className={`${category === "reflections" ? "" : category === "dreams" ? "rounded-full" : "rounded-3xl"} overflow-hidden w-[240px] h-[240px]`}>
          <img src={`https://tripiz.abandon.ai/api/autoglyphs?hash=0x${params.id}`} alt={""} width={240} height={240} />
        </div>
        <div>
          {event?.content}
        </div>
      </div>
      <div className="flex-1 text-[#B3B3B3] font-medium text-sm">
        Comments
      </div>
    </div>
  )
}

export default Page;