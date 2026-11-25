import { writeFileSync } from "node:fs";
import { renderPassEmail, sendPassTo } from "../src/lib/email";
import { newToken } from "../src/lib/guests";
import { qrPng } from "../src/lib/qr";

const to = process.env.EMAIL_TEST_TO;
const sample = { fullName: "Adaeze Okafor", token: newToken() };

if (process.argv.includes("--preview")) {
  const out = "email-preview.html";
  const dataUri = `data:image/png;base64,${(await qrPng(sample.token)).toString("base64")}`;
  writeFileSync(out, renderPassEmail(sample).html.replace("cid:pass-qr", dataUri));
  console.log(`Wrote ${out}`);
  process.exit(0);
}

if (!to) {
  console.error("EMAIL_TEST_TO is not set. Add it to .env.local.");
  process.exit(1);
}

const sent = await sendPassTo(to, sample);
if (!sent) {
  console.error("Not sent. Check SMTP_HOST, SMTP_USER and SMTP_PASS in .env.local.");
  process.exit(1);
}
console.log(`Sample pass sent to ${to}`);
