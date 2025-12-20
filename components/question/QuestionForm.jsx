'use client';

import { useState } from 'react';
import QuestionMeta from './QuestionMeta';
import QuestionEditor from './QuestionEditor';
import MCQOptions from './MCQOptions';
import FillBlankAnswers from './FillBlankAnswers';
import IntegerAnswer from './IntegerAnswer';

export default function QuestionForm() {
  const [type, setType] = useState('MCQ');
  const [payload, setPayload] = useState({});

  function update(key, value) {
    setPayload({ ...payload, [key]: value });
  }

  async function submit(e) {
    e.preventDefault();

    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, question_type: type }),
    });

    alert('Question saved');
  }

  return (
    <form onSubmit={submit} className="card p-3">
      <QuestionMeta type={type} onChange={setType} onData={update} />

      <QuestionEditor onChange={(v) => update('question_html', v)} />

      {type === 'MCQ' && <MCQOptions onChange={(v) => update('options', v)} />}
      {type === 'FILL' && <FillBlankAnswers onChange={(v) => update('answers', v)} />}
      {type === 'INTEGER' && <IntegerAnswer onChange={(v) => update('integer', v)} />}

      <button className="btn btn-success mt-3">Save Question</button>
    </form>
  );
}
