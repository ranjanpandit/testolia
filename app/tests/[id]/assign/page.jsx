import AssignExam from "@/components/tests/AssignExam";

export default async function Page({ params }) {
  const {id} = await params      
  return (
    <div className="p-6 max-w-5xl">

      <AssignExam examId={id} />
    </div>
  );
}
