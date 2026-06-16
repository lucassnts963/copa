import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO  = 'lucassnts963/lucas-data';
const DATA_DIR     = join(process.cwd(), 'public', 'data', 'worldcup');
const ADMIN_KEY    = process.env.ADMIN_KEY || '';

const FILE_MAP = {
  matches:   'matches.json',
  scorers:   'scorers.json',
  bracket:   'bracket.json',
  standings: 'standings.json',
};

function isAuthed(request) {
  if (!ADMIN_KEY) return false;
  return request.headers.get('x-admin-key') === ADMIN_KEY;
}

async function pushToLucasData(filename, data) {
  if (!GITHUB_TOKEN) return { ok: false, error: 'GITHUB_TOKEN não configurado' };

  const filePath = `worldcup/${filename}`;
  const apiUrl   = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
  const headers  = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'copa.elucas.dev',
  };

  const getRes = await fetch(apiUrl, { headers, cache: 'no-store' });
  const sha    = getRes.ok ? (await getRes.json()).sha : undefined;

  const content  = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const putRes   = await fetch(apiUrl, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `chore: update worldcup/${filename} via admin`,
      content,
      sha,
      branch: 'main',
    }),
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    return { ok: false, error: `GitHub PUT ${putRes.status}: ${text.slice(0, 120)}` };
  }
  return { ok: true };
}

/** GET /api/copa/admin — verifica chave de admin */
export async function GET(request) {
  return Response.json({ ok: isAuthed(request) });
}

/** POST /api/copa/admin — salva dado no lucas-data e no arquivo local (dev) */
export async function POST(request) {
  if (!isAuthed(request)) {
    return Response.json({ ok: false, error: 'Não autorizado' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const { type, data } = body;
  const filename = FILE_MAP[type];
  if (!filename || !data) {
    return Response.json({ ok: false, error: 'type ou data ausentes' }, { status: 400 });
  }

  // Tenta gravar no arquivo local (só funciona em dev)
  try {
    writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // filesystem read-only em produção — esperado
  }

  // Empurra para lucas-data (funciona em produção)
  const result = await pushToLucasData(filename, data);
  if (!result.ok) {
    // Local write pode ter funcionado (dev) mas GitHub falhou — retorna aviso
    return Response.json({ ok: true, warning: result.error });
  }

  return Response.json({ ok: true });
}
