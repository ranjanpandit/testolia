import PDFDocument from "pdfkit";
import { db } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET(req, context) {
  const params = await context.params;
  const { paymentId } = params;

  try {
    const [rows] = await db.query(
      `SELECT fp.*, s.first_name, s.last_name, s.student_code
       FROM student_fee_payments fp
       JOIN students s ON s.id = fp.student_id
       WHERE fp.id = ?`,
      [paymentId]
    );

    if (!rows.length) return new Response("Receipt not found", { status: 404 });
    const p = rows[0];

    // ✅ PATH RESOLUTION: This is the only way Next.js finds files reliably
    const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");

    const pdfBuffer = await new Promise((resolve, reject) => {
      // Initialize doc WITHOUT a default font to prevent early crashes
      const doc = new PDFDocument({ 
        size: "A4", 
        margin: 50,
        bufferPages: true 
      });
      
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // ✅ THE CRITICAL FIX: Manually load the TTF font
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      } else {
        // Only if the file is missing, we try a fallback that might work on Windows
        doc.font("Courier"); 
      }

      /* ---------------- DESIGN SECTION ---------------- */
      
      // Branding Header
      doc.rect(0, 0, 612, 60).fill("#0f172a"); 
      doc.fillColor("#ffffff").fontSize(20).text("EXAM.SCHOOL", 50, 22);
      doc.fontSize(10).text("DIGITAL PAYMENT RECEIPT", 420, 26);

      doc.moveDown(4);

      // Main Title
      doc.fillColor("#0f172a").fontSize(22).text("Payment Acknowledgment", 50, 100);
      doc.fontSize(10).fillColor("#64748b").text(`Voucher ID: #INV-${p.id} | Issued: ${new Date().toLocaleString()}`);
      
      doc.moveDown(2);

      // Candidate Grid
      doc.fillColor("#0f172a").fontSize(12).text("Candidate Record", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(`Full Identity: ${p.first_name} ${p.last_name}`);
      doc.text(`Registry Code: ${p.student_code}`);
      
      doc.moveDown(2);

      // Financial Ledger Table
      doc.rect(50, doc.y, 512, 30).fill("#f8fafc").stroke("#e2e8f0");
      doc.fillColor("#475569").fontSize(9).text("DESCRIPTION", 65, doc.y - 20);
      doc.text("CHANNEL", 300, doc.y - 12);
      doc.text("NET TOTAL", 480, doc.y - 12);

      doc.moveDown(2);
      doc.fillColor("#0f172a").fontSize(11).text("Academic Enrollment & Processing", 65, doc.y);
      doc.text(p.payment_mode.toUpperCase(), 300, doc.y - 12);
      
      doc.fontSize(16).fillColor("#10b981").text(`INR ${p.amount}`, 450, doc.y - 15, { align: 'right', width: 110 });

      doc.moveTo(50, doc.y + 15).lineTo(562, doc.y + 15).stroke("#e2e8f0");
      
      doc.moveDown(5);

      // Footer
      doc.rect(50, 700, 512, 50).fill("#f1f5f9");
      doc.fillColor("#94a3b8").fontSize(8).text(
        "This is an electronically generated document authorized by Exam.School. Verification is handled via the central registry. No physical signature is required.",
        50, 715, { width: 512, align: 'center' }
      );

      doc.end();
    });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=receipt-${paymentId}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF_STRICT_ERROR:", err);
    // Returning the specific error to the screen to help you debug file paths
    return new Response(`PDF Engine Failure: ${err.message}`, { status: 500 });
  }
}