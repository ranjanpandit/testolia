import AssignExam from "@/components/tests/AssignExam";

export default async function Page({ params }) {
  const {id} = await params      
  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-xl font-semibold mb-4">
        Assign Exam
      </h1>

      <AssignExam examId={id} />
    </div>
  );
}
