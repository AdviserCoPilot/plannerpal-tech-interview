import request from "supertest";
import { vi } from "vitest";

let resolvedValue: any = undefined;

const { knexInstance, chain } = vi.hoisted(() => {
  const _chain: any = {};
  const methods = [
    "select", "where", "andWhere", "orderBy", "join",
    "first", "insert", "update", "count", "onConflict", "merge",
    "del", "from",
  ];
  for (const m of methods) {
    _chain[m] = vi.fn(() => _chain);
  }
  _chain.as = vi.fn(() => _chain);
  _chain.then = undefined as any; // set below after resolvedValue is accessible

  const _knexInstance: any = vi.fn(() => _chain);
  for (const m of methods) {
    _knexInstance[m] = _chain[m];
  }
  _knexInstance.as = _chain.as;
  _knexInstance.raw = vi.fn((val: string) => val);
  _knexInstance.transaction = vi.fn();

  return { knexInstance: _knexInstance, chain: _chain };
});

// Patch .then to use the outer resolvedValue
chain.then = function (resolve: any, reject: any) {
  return Promise.resolve(resolvedValue).then(resolve, reject);
};

vi.mock("../db", () => ({ default: knexInstance }));

import app from "../app";

function setResolved(val: any) { resolvedValue = val; }

afterEach(() => {
  vi.clearAllMocks();
  resolvedValue = undefined;
});

describe("GET /classes", () => {
  it("returns list of classes", async () => {
    setResolved([
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        name: "Piano",
        capacity: 2,
        registered_count: "2",
      },
    ]);

    const res = await request(app).get("/classes");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Piano");
    expect(res.body[0].capacity).toBe(2);
  });
});

describe("GET /classes/:id", () => {
  it("returns a single class", async () => {
    setResolved({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      name: "Piano",
      capacity: 2,
      registered_count: "2",
    });

    const res = await request(app).get(
      "/classes/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    );
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Piano");
  });

  it("returns 404 when class not found", async () => {
    setResolved(undefined);

    const res = await request(app).get(
      "/classes/00000000-0000-0000-0000-000000000000"
    );
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Class not found");
  });
});
