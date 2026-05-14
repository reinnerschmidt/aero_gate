import { NextResponse } from 'next/server';
import { localPool, externalPool } from '@/utils/db';

export async function POST(req) {
  try {
    const data = await req.json();

    // 1. Buscar o serial da aeronave no banco externo para salvar log legível
    let serial = data.aeronave_label || 'Desconhecido';
    try {
      const { rows } = await externalPool.query('SELECT serial FROM aircraft WHERE id = $1', [data.aeronave_id]);
      if (rows.length > 0) serial = rows[0].serial;
    } catch (err) {
      console.error('Error fetching serial for log:', err);
    }

    // 2. Salvar no banco local (Aero Gate)
    const query = `
      INSERT INTO access_logs (
        aeronave_serial, 
        area_name,
        employee_type,
        nome, 
        id_number,
        acompanhante,
        op_om,
        autorizador,
        alianca_check, 
        chave_check, 
        relogio_check, 
        cracha_check, 
        timestamp,
        created_at,
        status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),'pendente')
    `;

    const values = [
      serial,
      data.area_id,
      data.employee_type || null,
      data.nome || null,
      data.id_number || null,
      data.acompanhante || null,
      data.op_om || null,
      data.autorizador || null,
      data.alianca_check || null,
      data.chave_check || null,
      data.relogio_check || null,
      data.cracha_check || null,
      new Date().toISOString(),
    ];

    await localPool.query(query, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
