import { NextResponse } from 'next/server';
import { localPool } from '@/utils/db';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const query = 'SELECT id, username, role FROM users WHERE username = $1 AND password = $2';
    const { rows } = await localPool.query(query, [username, password]);

    if (rows.length > 0) {
      return NextResponse.json({ 
        success: true, 
        user: rows[0] 
      });
    }

    return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
