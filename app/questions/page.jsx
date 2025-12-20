'use client';

import { useEffect, useState } from 'react';

export default function Page() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch('/api/questions').then(r => r.json()).then(setList);
  }, []);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Question</th>
          <th>Type</th>
          <th>Marks</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {list.map(q => (
          <tr key={q.id}>
            <td>{q.id}</td>
            <td dangerouslySetInnerHTML={{ __html: q.question_html }} />
            <td>{q.question_type}</td>
            <td>{q.marks}</td>
            <td>
              <a href={`/questions/${q.id}/view`}>View</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
