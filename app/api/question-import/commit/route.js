import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const CHUNK_SIZE = 500;

export async function POST(req) {
  const { data } = await req.json();
  if (!Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const conn = await db.getConnection();
  let inserted = 0;

  try {
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);

      await conn.beginTransaction();

      for (const q of chunk) {
        const [qRes] = await conn.query(
          `INSERT INTO questions
          (question_text, question_type, marks, negative_marks, subject, topic, difficulty, explanation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            q.question_text,
            q.question_type,
            q.marks || 1,
            q.negative_marks || 0,
            q.subject,
            q.topic,
            q.difficulty,
            q.explanation,
          ]
        );

        const questionId = qRes.insertId;

        if (["mcq", "scq"].includes(q.question_type)) {
          const optionRows = [];

          ["A", "B", "C", "D"].forEach(letter => {
            const text = q[`option_${letter.toLowerCase()}`];
            if (!text) return;

            optionRows.push([
              questionId,
              text,
              q.correct_options.includes(letter) ? 1 : 0,
            ]);
          });

          if (optionRows.length) {
            await conn.query(
              `INSERT INTO question_options
              (question_id, option_text, is_correct)
              VALUES ?`,
              [optionRows]
            );
          }
        }

        inserted++;
      }

      await conn.commit();
    }

    return NextResponse.json({
      success: true,
      inserted,
    });
  } catch (e) {
    await conn.rollback();
    return NextResponse.json(
      { error: "Bulk import failed", details: e.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
