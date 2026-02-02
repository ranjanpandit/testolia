import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    // ✅ FIX: Extract sectionId from params before using it
    const resolvedParams = await params;
    const sectionId = resolvedParams.sectionId;

    if (!sectionId) {
      return Response.json(
        { message: "Section Identifier is missing" },
        { status: 400 }
      );
    }

    // Now sectionId is defined and safe to use in the query
    const [rows] = await db.query(
      `SELECT 
        id, 
        exam_pattern_id as exam_id, 
        section_name as name, 
        total_questions, 
        marks_per_question, 
        negative_marks 
      FROM exam_pattern_sections 
      WHERE id = ?`,
      [sectionId]
    );

    if (rows.length === 0) {
      return Response.json(
        { message: "Section record not identified" },
        { status: 404 }
      );
    }

    return Response.json(rows[0]);

  } catch (err) {
    console.error("FATAL_REGISTRY_ERROR:", err);
    return Response.json(
      { message: "Protocol Error: Internal Server Exception" },
      { status: 500 }
    );
  }
}

/* ===============================
   UPDATE SECTION
   =============================== */
export async function PUT(req, { params }) {
  try {
    const { sectionId } =await params;

    const {
      section_name,
      total_questions,
      marks_per_question,
      negative_marks,
      duration_minutes,
      randomize,
    } = await req.json();

    if (!section_name || !total_questions) {
      return Response.json(
        { message: "Section name and total questions are required" },
        { status: 400 }
      );
    }

    // 🔐 Optional safety check (recommended)
    const [[existing]] = await db.query(
      `SELECT id FROM exam_pattern_sections WHERE id = ?`,
      [sectionId]
    );

    if (!existing) {
      return Response.json(
        { message: "Section not found" },
        { status: 404 }
      );
    }

    await db.query(
      `
      UPDATE exam_pattern_sections
      SET
        section_name = ?,
        total_questions = ?,
        marks_per_question = ?,
        negative_marks = ?,
        duration_minutes = ?,
        randomize = ?
      WHERE id = ?
      `,
      [
        section_name,
        Number(total_questions),
        Number(marks_per_question),
        Number(negative_marks),
        duration_minutes ? Number(duration_minutes) : null,
        randomize ? 1 : 0,
        sectionId,
      ]
    );

    return Response.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (err) {
    console.error("PUT section error:", err);
    return Response.json(
      { message: "Failed to update section" },
      { status: 500 }
    );
  }
}

/* ===============================
   DELETE SECTION
   =============================== */
export async function DELETE(req, { params }) {
  try {
    const { sectionId } =await params;

    // 1️⃣ Check if section exists
    const [[section]] = await db.query(
      `SELECT id FROM exam_pattern_sections WHERE id = ?`,
      [sectionId]
    );

    if (!section) {
      return Response.json(
        { message: "Section not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Check if questions are mapped to this section
    const [[count]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM exam_section_questions
       WHERE section_id = ?`,
      [sectionId]
    );

    if (count.total > 0) {
      return Response.json(
        {
          message:
            "Section cannot be deleted. Remove assigned questions first.",
        },
        { status: 409 }
      );
    }

    // 3️⃣ Safe delete
    await db.query(`DELETE FROM exam_pattern_sections WHERE id = ?`, [sectionId]);

    return Response.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (err) {
    console.error("DELETE section error:", err);
    return Response.json(
      { message: "Failed to delete section" },
      { status: 500 }
    );
  }
}

