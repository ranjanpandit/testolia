export default function QuestionPanel({
  question,
  answer,
  allowReview,
  onAnswer,
  onReviewToggle,
  onNext,
  onPrev,
}) {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div
        className="mb-4 text-sm"
        dangerouslySetInnerHTML={{
          __html: question.question_text,
        }}
      />

      {question.question_type === "scq" &&
        question.options.map((o) => (
          <label
            key={o.id}
            className="block border rounded-lg px-3 py-2 mb-2 cursor-pointer"
          >
            <input
              type="radio"
              checked={answer?.answer?.[0] === o.id}
              onChange={() => onAnswer([o.id])}
            />
            <span className="ml-2">{o.option_text}</span>
          </label>
        ))}

      <div className="flex items-center justify-between mt-6">
        <button onClick={onPrev} className="border px-4 py-2 rounded">
          ← Prev
        </button>

        {allowReview && (
          <button
            onClick={onReviewToggle}
            className="px-4 py-2 rounded bg-purple-600 text-white"
          >
            Mark for Review
          </button>
        )}

        <button onClick={onNext} className="border px-4 py-2 rounded">
          Next →
        </button>
      </div>
    </div>
  );
}
