import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { AddressInfo } from "node:net";

process.env.CEP_DB_PATH = join(tmpdir(), `cep-explorer-${process.pid}.db`);
const { createCepServer, normalizeCep } = await import("../src/server.ts");

const server = createCepServer();
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close(error => error ? reject(error) : resolve())
  );
});

test("normaliza CEP com máscara", () => {
  assert.equal(normalizeCep("01001-000"), "01001000");
  assert.equal(normalizeCep("123"), null);
});

test("health endpoint responde ok", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("CEP inválido retorna 400", async () => {
  const response = await fetch(`${baseUrl}/api/cep/123`);
  assert.equal(response.status, 400);
});
