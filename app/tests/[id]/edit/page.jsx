import EditTest from "@/components/tests/EditTest";

export default async function Page({ params }) {
  const {id} =  await params    
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold mb-4">Edit Test</h1>
      <EditTest examId={id} />
    </div>
  );
}
