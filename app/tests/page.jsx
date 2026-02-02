import TestList from "@/components/tests/TestList";

export default function Page() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Tests</h1>
      
      </div>

      <TestList />
    </div>
  );
}
