'use client';

const Page = () => {

  const list = [
    {
      class: "Emotions",
      color: "#DB148B",
    },
    {
      class: "People",
      color: "#016450",
    },
    {
      class: "Objects",
      color: "#8400E7",
    },
    {
      class: "Characters",
      color: "#E8125C",
    },
    {
      class: "Places",
      color: "#27856A",
    },
    {
      class: "Themes",
      color: "#BC5800",
    },
    {
      class: "Actions",
      color: "#158A08",
    },
  ];

  return (
    <div className="px-6 space-y-3">
      <div className="text-2xl py-2">
        View All
      </div>
      <div className="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        {
          list.map((item, index) => (
            <div
              style={{
                background: item.color
              }}
              className="h-40 rounded-lg p-4 text-white font-medium text-2xl" key={index}>
                {item.class}
            </div>
          ))
        }
        <div className="h-80">
        </div>
      </div>
    </div>
  )
}

export default Page