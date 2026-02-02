"use client";

import { useEffect, useState } from "react";
import ExamHeader from "./ExamHeader";
import QuestionNavigator from "./QuestionNavigator";
import QuestionPanel from "./QuestionPanel";
import SubmitModal from "./SubmitModal";

export default function StudentExam({ examId, studentId }) {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState({ section: 0, question: 0 });
  const [showSubmit, setShowSubmit] = useState(false);

  // Load attempt + questions
  useEffect(() => {
    fetch(`/api/exam/${examId}/attempt`, {
      headers: { "x-student-id": studentId },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setAnswers(JSON.parse(d.attempt.answers_json || "{}"));
      });
  }, []);

  // Mark question as visited
  useEffect(() => {
    if (!data) return;

    const q =
      data.sections[current.section]?.questions[current.question];
    if (!q) return;

    setAnswers((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        visited: true,
      },
    }));
  }, [current.section, current.question, data]);

  if (!data) return <div className="p-6">Loading exam…</div>;

  const section = data.sections[current.section];
  const question = section.questions[current.question];

  function canSwitchSection(targetIndex) {
    if (data.pattern?.allow_section_switch) return true;
    return targetIndex <= current.section;
  }

  function submitExam() {
    fetch(`/api/exam/${examId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId }),
    }).then(() => {
      window.location.href = `/exam/${examId}/submitted`;
    });
  }

  const totalQuestions = data.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  const answeredCount = Object.values(answers).filter(
    (a) => a?.answer?.length
  ).length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <ExamHeader
        examId={examId}
        studentId={studentId}
        onSubmit={() => setShowSubmit(true)}
        sections={data.sections}
        currentSection={current.section}
        canSwitchSection={canSwitchSection}
        onSectionChange={(i) =>
          setCurrent({ section: i, question: 0 })
        }
      />

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <QuestionNavigator
          section={section}
          answers={answers}
          currentQuestion={current.question}
          onJump={(i) =>
            setCurrent({ ...current, question: i })
          }
        />

        <QuestionPanel
          question={question}
          answer={answers[question.id]}
          allowReview={data.pattern?.allow_review}
          onAnswer={(ans) =>
            setAnswers({
              ...answers,
              [question.id]: {
                ...answers[question.id],
                answer: ans,
              },
            })
          }
          onReviewToggle={() =>
            setAnswers({
              ...answers,
              [question.id]: {
                ...answers[question.id],
                marked_for_review:
                  !answers[question.id]?.marked_for_review,
              },
            })
          }
          onNext={() =>
            setCurrent({
              ...current,
              question: Math.min(
                current.question + 1,
                section.questions.length - 1
              ),
            })
          }
          onPrev={() =>
            setCurrent({
              ...current,
              question: Math.max(current.question - 1, 0),
            })
          }
        />
      </div>

      {/* SUBMIT MODAL */}
      <SubmitModal
        open={showSubmit}
        unanswered={totalQuestions - answeredCount}
        onCancel={() => setShowSubmit(false)}
        onConfirm={submitExam}
      />
    </div>
  );
}
