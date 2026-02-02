export default function QuestionNavigator({
  section,
  answers,
  currentQuestion,
  onJump,
}) {
  function status(q) {
    const a = answers[q.id];
    if (!a?.visited) return "bg-gray-200";
    if (a.marked_for_review && a.answer)
      return "bg-orange-500 text-white";
    if (a.marked_for_review)
      return "bg-purple-500 text-white";
    if (a.answer)
      return "bg-green-500 text-white";
    return "bg-blue-400 text-white";
  }

  return (
    <div className="w-64 bg-white border-r p-4 overflow-y-auto">
      <div className="text-sm font-semibold mb-3">
        Questions
      </div>

      <div className="grid grid-cols-5 gap-2">
        {section.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => onJump(i)}
            className={`h-8 rounded text-xs ${status(q)}
              ${i === currentQuestion ? "ring-2 ring-black" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* LEGEND */}
      <div className="mt-4 text-xs space-y-1">
        <Legend color="bg-gray-200" label="Not Visited" />
        <Legend color="bg-blue-400" label="Visited" />
        <Legend color="bg-green-500" label="Answered" />
        <Legend color="bg-purple-500" label="Review" />
        <Legend color="bg-orange-500" label="Answered + Review" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded ${color}`} />
      {label}
    </div>
  );
}
