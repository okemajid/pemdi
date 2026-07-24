const { query } = require("./lib/db");
async function run() {
  const rows = await query("SELECT id, bobot FROM kriteria WHERE indikator_id = 'i19'");
  console.log(rows);
}
run();
