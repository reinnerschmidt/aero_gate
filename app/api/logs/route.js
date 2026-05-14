import { NextResponse } from 'next/server';
import { localPool } from '@/utils/db';

export async function GET() {
  try {
    const { rows } = await localPool.query(
      'SELECT * FROM access_logs ORDER BY created_at DESC LIMIT 100'
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, status, closed_by, has_damage, damage_photo } = await req.json();

    let query, values;

    if (status === 'encerrado') {
      query = `
        UPDATE access_logs 
        SET status = $1, closed_at = NOW(), closed_by = $2, has_damage = $3, damage_photo = $4
        WHERE id = $5 RETURNING *
      `;
      values = [status, closed_by || null, has_damage || false, damage_photo || null, id];
    } else {
      // Reabrir card
      query = `
        UPDATE access_logs 
        SET status = $1, closed_at = NULL, closed_by = NULL
        WHERE id = $2 RETURNING *
      `;
      values = [status, id];
    }

    const { rows } = await localPool.query(query, values);
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
