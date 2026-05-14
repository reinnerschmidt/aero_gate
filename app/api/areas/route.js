import { NextResponse } from 'next/server';
import { localPool, externalPool } from '@/utils/db';

// GET: Lista áreas do banco local e do banco externo (Comparador)
export async function GET() {
  try {
    // 1. Busca áreas locais
    const localResult = await localPool.query('SELECT id, name, \'local\' as origin FROM management_areas ORDER BY name ASC');
    
    // 2. Busca áreas globais do Comparador (Cockpit, Eletrônicos, etc)
    let externalAreas = [];
    try {
      const externalResult = await externalPool.query('SELECT id, name, \'external\' as origin FROM global_areas ORDER BY name ASC');
      externalAreas = externalResult.rows;
    } catch (err) {
      console.error('External Areas Fetch Error:', err);
    }

    // Une as duas listas
    const combined = [...localResult.rows, ...externalAreas];
    
    // Remove duplicatas por nome
    const unique = combined.reduce((acc, curr) => {
      if (!acc.find(item => item.name.toLowerCase() === curr.name.toLowerCase())) {
        acc.push(curr);
      }
      return acc;
    }, []);

    return NextResponse.json(unique);
  } catch (error) {
    console.error('Local Areas Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Cria uma nova área local
export async function POST(req) {
  try {
    const { name } = await req.json();
    const query = 'INSERT INTO management_areas (name) VALUES ($1) RETURNING *';
    const { rows } = await localPool.query(query, [name]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Exclui uma área local
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await localPool.query('DELETE FROM management_areas WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Edita uma área local
export async function PUT(req) {
  try {
    const { id, name } = await req.json();
    const query = 'UPDATE management_areas SET name = $1 WHERE id = $2 RETURNING *';
    const { rows } = await localPool.query(query, [name, id]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
