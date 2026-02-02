import QuestionList from "@/components/question/QuestionList";

export default function Page() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Question Bank</h1>
          <p className="text-sm text-gray-500">
            Manage all questions and filters.
          </p>
        </div>
        <div>
          <a
            href="/question-bank/add"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Question
          </a>
          &nbsp;
          <a
          href="/question-bank/import"
          className="items-center gap-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Import
        </a>
        </div>
      </div>

      <QuestionList />
    </div>
  );
}
