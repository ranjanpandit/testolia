export default function IntegerAnswer({ onChange }) {
  return (
    <div>
      <label>Correct Value</label>
      <input type="number" className="form-control" onChange={e => onChange(e.target.value)} />
    </div>
  );
}
