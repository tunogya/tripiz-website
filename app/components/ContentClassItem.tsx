import PostCardById from "./PostCardById"

const ContentClassItem = ({ category, value }: any) => {
  return (
    <div className="">
      <div className={"text-white text-2xl font-medium"}>{category}</div>
      <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mt-3">
        {
          value.map((item: any) => (
            <PostCardById key={item} id={item} />
          ))
        }
      </div>
    </div>
  )
}

export default ContentClassItem