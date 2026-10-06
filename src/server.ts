import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getCachedAddress, getHistory, saveAddress } from "./db.ts";

const currentDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const publicDir = resolve(currentDir, "..", "public");

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

export function normalizeCep(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
}

async function fetchViaCep(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal: AbortSignal.timeout(7000)
  });
  if (!response.ok) throw new Error("Erro no ViaCEP");

  const data = await response.json() as Record<string, unknown>;
  if (data.erro) return null;

  return {
    cep,
    logradouro: String(data.logradouro || ""),
    bairro: String(data.bairro || ""),
    cidade: String(data.localidade || ""),
    estado: String(data.uf || "")
  };
}

async function handleApi(req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> {
  if (!url.pathname.startsWith("/api/")) return false;

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { status: "ok" });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/history") {
    sendJson(res, 200, getHistory(12));
    return true;
  }

  const match = url.pathname.match(/^\/api\/cep\/(.+)$/);
  if (req.method === "GET" && match) {
    const cep = normalizeCep(decodeURIComponent(match[1]));
    if (!cep) {
      sendJson(res, 400, { error: "CEP inválido. Informe exatamente 8 números." });
      return true;
    }

    const cached = getCachedAddress(cep);
    if (cached) {
      sendJson(res, 200, { ...cached, cache: true });
      return true;
    }

    try {
      const address = await fetchViaCep(cep);
      if (!address) {
        sendJson(res, 404, { error: "CEP não encontrado." });
        return true;
      }
      const saved = saveAddress(address);
      sendJson(res, 200, { ...saved, cache: false });
    } catch {
      sendJson(res, 502, { error: "Não foi possível consultar o ViaCEP agora." });
    }
    return true;
  }

  sendJson(res, 404, { error: "Rota não encontrada." });
  return true;
}

async function serveStatic(res: ServerResponse, pathname: string) {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const safePath = resolve(publicDir, requested);

  if (!safePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(safePath);
    const mime: Record<string, string> = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8"
    };
    res.writeHead(200, { "Content-Type": mime[extname(safePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

export function createCepServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      if (await handleApi(req, res, url)) return;
      if (req.method !== "GET") {
        res.writeHead(405);
        res.end("Method not allowed");
        return;
      }
      await serveStatic(res, url.pathname);
    } catch {
      sendJson(res, 500, { error: "Erro interno." });
    }
  });
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.PORT || 3001);
  createCepServer().listen(port, "127.0.0.1", () => {
    console.log(`Consulta CEP Web: http://127.0.0.1:${port}`);
  });
}
