export default function FillBlankAnswers({ onChange }) {
  return (
    <div>
      <h6>Correct Answers</h6>
      <input className="form-control mb-2" onChange={e => onChange([e.target.value])} />
    </div>
  );
}
