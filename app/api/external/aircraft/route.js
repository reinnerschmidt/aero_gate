import { NextResponse } from 'next/server';
import { externalPool } from '@/utils/db';

export async function GET() {
  try {
    // Buscamos apenas aeronaves que estão com o status 'Ativo'
    const query = "SELECT id, serial, name FROM aircraft WHERE status = 'Ativo' ORDER BY serial ASC";
    const { rows } = await externalPool.query(query);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('External Aircraft Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
