export default async function Home() {
  
  return (
    <div>
      <div className={"text-white text-2xl font-medium px-6"}>Latest Users</div>
      <div className={"flex-1 overflow-auto"}>
        <div className={"flex flex-row"}>
          <div className="grid grid-cols-6 p-3">
          </div>
        </div>
      </div>
    </div>
  );
}