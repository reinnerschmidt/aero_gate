import { NextResponse } from 'next/server';
import { localPool } from '@/utils/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const aircraftSerial = searchParams.get('aircraft_serial');
    const areaName = searchParams.get('area_name');

    if (!aircraftSerial || !areaName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const query = `
      SELECT id, nome, id_number 
      FROM access_logs 
      WHERE aeronave_serial = $1 AND area_name = $2 AND status = 'pendente'
      LIMIT 1
    `;
    const { rows } = await localPool.query(query, [aircraftSerial, areaName]);

    return NextResponse.json({ hasOpenCard: rows.length > 0, card: rows[0] || null });
  } catch (error) {
    console.error('Check Open Card Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
