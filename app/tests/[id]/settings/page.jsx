import TestSettings from "@/components/tests/TestSettings";

export default async function Page({ params }) {
  const {id} =  await params       
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold mb-4">Test Settings</h1>
      <TestSettings examId={id} />
    </div>
  );
}
