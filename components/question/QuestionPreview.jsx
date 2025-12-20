export default function QuestionPreview({ question }) {
  return (
    <div className="card p-3">
      <div dangerouslySetInnerHTML={{ __html: question.question_html }} />
    </div>
  );
}
