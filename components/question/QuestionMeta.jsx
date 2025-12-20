export default function QuestionMeta({ type, onChange, onData }) {
  return (
    <div className="row mb-3">
      <div className="col-md-3">
        <label>Subject</label>
        <select className="form-select" onChange={e => onData('subject_id', e.target.value)}>
          <option value="">Select</option>
        </select>
      </div>

      <div className="col-md-3">
        <label>Question Type</label>
        <select className="form-select" value={type} onChange={e => onChange(e.target.value)}>
          <option value="MCQ">MCQ</option>
          <option value="FILL">Fill in Blank</option>
          <option value="INTEGER">Integer</option>
        </select>
      </div>

      <div className="col-md-2">
        <label>Marks</label>
        <input type="number" className="form-control" onChange={e => onData('marks', e.target.value)} />
      </div>

      <div className="col-md-2">
        <label>Negative</label>
        <input type="number" className="form-control" onChange={e => onData('negative_marks', e.target.value)} />
      </div>
    </div>
  );
}
