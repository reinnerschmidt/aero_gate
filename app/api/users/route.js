import { NextResponse } from 'next/server';
import { localPool } from '@/utils/db';

// Listar usuários (Apenas Admin deveria chamar isso)
export async function GET() {
  try {
    const { rows } = await localPool.query('SELECT id, username, role, created_at FROM users ORDER BY username ASC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Criar novo usuário (Admin ou Monitor)
export async function POST(req) {
  try {
    const { username, password, role } = await req.json();
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role';
    const { rows } = await localPool.query(query, [username, password, role]);
    
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (error.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Usuário já existe' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Excluir usuário
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id === '1') return NextResponse.json({ error: 'Não é possível excluir o admin principal' }, { status: 403 });
    
    await localPool.query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
