import TestSettings from "@/components/tests/TestSettings";

export default async function Page({ params }) {
  const {id} =  await params       
  return (
    <div className="p-6 max-w-4xl">
      <TestSettings examId={id} />
    </div>
  );
}
