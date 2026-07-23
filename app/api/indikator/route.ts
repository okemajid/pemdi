import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const tahun = parseInt(searchParams.get('tahun') || '2026', 10);

    let sql = `
      SELECT 
        i.id, i.no, i.nama, i.tipe, i.bobot, i.nilai_capaian as nilaiCapaian, i.predikat, i.aspek_id as aspekId,
        a.nama as aspekNama, a.no as aspekNo,
        (SELECT GROUP_CONCAT(user_id) FROM indikator_akses WHERE indikator_id = i.id) as aksesUsers
      FROM indikator i
      LEFT JOIN aspek a ON i.aspek_id = a.id
    `;
    const params: any[] = [];

    if (userId) {
      sql += ` INNER JOIN indikator_akses ia ON i.id = ia.indikator_id WHERE ia.user_id = ? AND a.tahun = ? `;
      params.push(userId, tahun);
    } else {
      sql += ` WHERE a.tahun = ? `;
      params.push(tahun);
    }

    sql += ` ORDER BY CAST(SUBSTRING_INDEX(i.no, '.', 1) AS UNSIGNED), CAST(SUBSTRING_INDEX(i.no, '.', -1) AS UNSIGNED)`;

    const indikators = await query(sql, params) as any[];
    
    // Fetch all kriteria
    const kriteriaRows = await query(`
      SELECT k.id, k.indikator_id, k.level, k.label, k.bobot, k.deskripsi, k.status, b.status as upload_status
      FROM kriteria k
      LEFT JOIN bukti_dukung b ON k.id = b.kriteria_id
    `) as any[];

    const kriteriaMap = new Map();
    kriteriaRows.forEach(k => {
      if (!kriteriaMap.has(k.indikator_id)) kriteriaMap.set(k.indikator_id, []);
      kriteriaMap.get(k.indikator_id).push({
        id: k.id,
        level: k.level,
        label: k.label,
        bobot: k.bobot,
        deskripsi: k.deskripsi,
        status: k.upload_status || k.status || 'empty'
      });
    });
    
    // Convert comma-separated string to array
    const formatted = indikators.map(ind => ({
      ...ind,
      aksesUsers: ind.aksesUsers ? ind.aksesUsers.split(',') : [],
      kriteria: kriteriaMap.get(ind.id) || []
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching indikator:", error);
    return NextResponse.json({ error: "Failed to fetch indikator" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { aspekId, no, tipe, bobot, nama, aksesUsers } = body;

    if (!aspekId || !no || !tipe || !bobot || !nama) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `i_${Date.now()}`;

    await query(
      `INSERT INTO indikator (id, no, nama, tipe, bobot, aspek_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, no, nama, tipe, bobot, aspekId]
    );

    if (Array.isArray(aksesUsers) && aksesUsers.length > 0) {
      for (const uId of aksesUsers) {
        await query(`INSERT INTO indikator_akses (indikator_id, user_id) VALUES (?, ?)`, [id, uId]);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating indikator:", error);
    return NextResponse.json({ error: "Failed to create indikator" }, { status: 500 });
  }
}
