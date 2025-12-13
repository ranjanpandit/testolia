import PDFDocument from "pdfkit/js/pdfkit.standalone";
import { db } from "@/lib/db";

export async function GET(req, context) {
  const params = await context.params;
  const { paymentId } = params;

  try {
    const [rows] = await db.query(
      `SELECT 
         fp.*, 
         s.first_name, 
         s.last_name, 
         s.student_code
       FROM student_fee_payments fp
       JOIN students s ON s.id = fp.student_id
       WHERE fp.id = ?`,
      [paymentId]
    );

    if (!rows.length) {
      return new Response("Receipt not found", { status: 404 });
    }

    const p = rows[0];

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {});

    /* ---------------- PDF CONTENT ---------------- */

    doc.fontSize(20).text("FEE RECEIPT", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Student Name: ${p.first_name} ${p.last_name}`);
    doc.text(`Student Code: ${p.student_code}`);
    doc.moveDown();

    doc.text(`Receipt No: ${p.id}`);
    doc.text(`Payment Date: ${new Date(p.paid_on).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text(`Amount Paid: ₹ ${p.amount}`);
    doc.fontSize(12);
    doc.text(`Payment Mode: ${p.payment_mode}`);
    doc.text(`Reference No: ${p.reference_no || "-"}`);
    doc.moveDown(2);

    doc
      .fontSize(10)
      .text(
        "This is a system generated receipt. No signature required.",
        { align: "center" }
      );

    doc.end();

    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=receipt-${paymentId}.pdf`,
      },
    });
  } catch (err) {
    console.error("Receipt error:", err);
    return new Response("Failed to generate receipt", { status: 500 });
  }
}
