import useExamTimer, { formatTime } from "./useExamTimer";

export default function ExamHeader({
  examId,
  studentId,
  onSubmit,
  sections,
  currentSection,
  canSwitchSection,
  onSectionChange,
}) {
  const seconds = useExamTimer(examId, studentId, onSubmit);

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {sections.map((s, idx) => (
          <button
            key={s.id}
            disabled={!canSwitchSection(idx)}
            onClick={() => onSectionChange(idx)}
            className={`px-3 py-1 text-xs rounded
              ${
                idx === currentSection
                  ? "bg-blue-600 text-white"
                  : "border"
              }
              disabled:opacity-40`}
          >
            {s.section_name}
          </button>
        ))}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <div className="text-sm font-semibold text-red-600">
          ⏱ {seconds !== null ? formatTime(seconds) : "--:--:--"}
        </div>

        <button
          onClick={onSubmit}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
