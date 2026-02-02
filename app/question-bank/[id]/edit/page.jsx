import EditQuestion from "@/components/question/EditQuestion";

export default async function Page({ params }) {
  const {id} = await params      
  return (
    <div className="p-6">
      <EditQuestion id={id} />
    </div>
  );
}
