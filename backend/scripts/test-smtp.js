import dotenv from "dotenv";
dotenv.config();

import createTransporter from "../src/utils/mailer.js"; // ← changed path

(async () => {
  const transporter = createTransporter();

  try {
    await transporter.verify();
    console.log("✅ SMTP Connected Successfully!");
  } catch (err) {
    console.error("❌ SMTP verify failed:", err);
  } finally {
    transporter.close?.();
    process.exit();
  }
})();
