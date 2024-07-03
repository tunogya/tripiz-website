import { FC } from "react"

const PostCard: FC<{ event: any }> = ({ event }) => {
  return (
    <div>
      <img src={`https://tripiz.abandon.ai/api/autoglyphs?hash=0x${event.id}`} alt={""} width={240} height={240}/>
      <div className="line-clamp-1">
        {event.content}
      </div>
    </div>
  )
}

export default PostCard