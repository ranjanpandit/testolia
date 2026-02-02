import SectionManager from "@/components/tests/SectionManager";

export default async function Page({ params }) {
   const {id} =  await params        
  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-xl font-semibold mb-4">Test Sections</h1>
      <SectionManager examId={id} />
    </div>
  );
}
