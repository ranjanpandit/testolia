import SectionQuestionMapper from "@/components/tests/SectionQuestionMapper";

export default async function Page({ params }) {
  const {sectionId} = await params      
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Add Questions to Section
      </h1>

      <SectionQuestionMapper sectionId={sectionId} />
    </div>
  );
}
