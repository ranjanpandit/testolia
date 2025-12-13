import { useStore } from "@/lib/store";

export default function Examination() {
  const { user } = useStore();

  return (
    <>
      <h1 className="text-2xl mb-4 font-bold">Examination</h1>

      {user?.role !== "viewer" && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Exam
        </button>
      )}
    </>
  );
}
