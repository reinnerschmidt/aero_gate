import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const data = await req.json();
    const filePath = path.join(process.cwd(), 'data', 'access_logs.json');

    // Read existing data
    let logs = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      logs = JSON.parse(fileContent);
    }

    // Add new entry with timestamp
    const newEntry = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    logs.push(newEntry);

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
