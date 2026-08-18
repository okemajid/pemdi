import { query } from "./lib/db.js";

async function run() {
  try {
    const res = await query("DESCRIBE surat_template");
    console.log(res);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
