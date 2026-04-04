import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET: Fetch Batch Details
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    const [rows] = await db.query(
      "SELECT * FROM batches WHERE id = ?", 
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Batch record not identified" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal Registry Error" }, { status: 500 });
  }
}

/**
 * PUT: Update Batch Blueprint
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      classId,
      name,
      capacity,
      startDate,
      status,
    } = body;

    // 1. Validation Logic
    if (!name?.trim() || !classId) {
      return NextResponse.json(
        { error: "Protocol Error: Batch name and Class ID are mandatory" },
        { status: 400 }
      );
    }

    // 2. Execute Plain MySQL Update
    const [result] = await db.query(
      `UPDATE batches SET 
        class_id = ?, 
        name = ?, 
        capacity = ?, 
        start_date = ?, 
        status = ?
      WHERE id = ?`,
      [
        parseInt(classId),
        name.trim(),
        capacity ? parseInt(capacity) : null,
        startDate ? new Date(startDate).toISOString().slice(0, 19).replace('T', ' ') : null,
        status || "active",
        id
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "No changes applied or record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Batch registry updated" });
  } catch (error) {
    console.error("PUT_BATCH_ERROR:", error);
    return NextResponse.json({ error: "Failed to synchronize batch data" }, { status: 500 });
  }
}

/**
 * DELETE: Purge Batch Registry
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // ✅ ENTERPRISE SAFETY: Check if students are assigned before purging
    const [students] = await db.query("SELECT id FROM students WHERE batch_id = ? LIMIT 1", [id]);
    
    if (students.length > 0) {
      return NextResponse.json(
        { error: "Purge Denied: Batch contains active student records" },
        { status: 409 }
      );
    }

    const [result] = await db.query("DELETE FROM batches WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Target record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Batch purged from registry" });
  } catch (error) {
    console.error("DELETE_BATCH_ERROR:", error);
    return NextResponse.json({ error: "Critical failure during record purge" }, { status: 500 });
  }
}