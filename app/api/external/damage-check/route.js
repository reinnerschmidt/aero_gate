import { NextResponse } from 'next/server';
import { externalPool } from '@/utils/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const aircraftId = searchParams.get('aircraft_id');
  const areaName = searchParams.get('area_name');

  if (!aircraftId || !areaName) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Query para buscar danos detectados pela IA ou marcados manualmente
    const query = `
      SELECT (
        SELECT COUNT(DISTINCT gas.subarea_id)::int 
        FROM (
          SELECT area_id FROM analyses WHERE aircraft_id = $1 AND status = 'Dano Detectado'
          UNION
          SELECT area_id FROM inspection_photos WHERE aircraft_id = $1 AND has_damage_check = 2
        ) AS unique_damages
        JOIN global_area_subareas gas ON unique_damages.area_id = gas.subarea_id
        JOIN global_areas ga ON gas.global_area_id = ga.id
        WHERE ga.name ILIKE $2
      ) as total_danos;
    `;

    // Usamos ILIKE $2 para ser case-insensitive e encontrar o cockpit/Cockpit
    const { rows } = await externalPool.query(query, [aircraftId, areaName]);
    const totalDanos = rows[0]?.total_danos || 0;

    return NextResponse.json({ total_danos: totalDanos });
  } catch (error) {
    console.error('Damage Check Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
