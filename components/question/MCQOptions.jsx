'use client';

import { useState } from 'react';

export default function MCQOptions({ onChange }) {
  const [opts, setOpts] = useState({});

  function update(k, v) {
    const o = { ...opts, [k]: v };
    setOpts(o);
    onChange(o);
  }

  return (
    <div>
      <h6>Options</h6>
      {['A','B','C','D'].map(k => (
        <input
          key={k}
          className="form-control mb-2"
          placeholder={`Option ${k}`}
          onChange={e => update(k, e.target.value)}
        />
      ))}
    </div>
  );
}
