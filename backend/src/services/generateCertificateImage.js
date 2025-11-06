import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";

/**
 * Generates a PNG certificate image for a participant and saves it temporarily.
 * Returns the file path.
 */
export async function generateCertificateImage(studentName, eventTitle, certId) {
  const canvas = createCanvas(1000, 700);
  const ctx = canvas.getContext("2d");

  // 🧾 Background
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 🏆 Header
  ctx.fillStyle = "#2563eb";
  ctx.font = "bold 40px Arial";
  ctx.fillText("Certificate of Participation", 250, 120);

  // 👤 Student Name
  ctx.fillStyle = "#111";
  ctx.font = "32px Arial";
  ctx.fillText(`This certifies that`, 320, 220);
  ctx.font = "bold 38px Arial";
  ctx.fillText(`${studentName}`, 350, 280);

  // 🏫 Event
  ctx.font = "28px Arial";
  ctx.fillText(`has successfully participated in`, 270, 340);
  ctx.font = "italic 32px Arial";
  ctx.fillText(`${eventTitle}`, 350, 400);

  // 🧾 Cert ID
  ctx.font = "20px Arial";
  ctx.fillText(`Certificate ID: ${certId}`, 340, 480);

  // 🕒 Date
  ctx.font = "20px Arial";
  ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, 340, 520);

  // 🖊️ Signature placeholder
  ctx.fillText("__________________", 700, 560);
  ctx.font = "18px Arial";
  ctx.fillText("Authorized Signatory", 720, 590);

  // 💾 Save to tmp folder
  const tmpDir = "./tmp";
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const filePath = path.join(tmpDir, `cert_${certId}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
