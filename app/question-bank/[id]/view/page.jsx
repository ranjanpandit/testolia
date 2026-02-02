import QuestionView from "@/components/question/QuestionView";

export default async function Page({ params }) {
  const {id} = await params;      
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">View Question</h1>
      <QuestionView id={id} />
    </div>
  );
}
