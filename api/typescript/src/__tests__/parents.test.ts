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
  _chain.then = undefined as any;

  const _knexInstance: any = vi.fn(() => _chain);
  for (const m of methods) {
    _knexInstance[m] = _chain[m];
  }
  _knexInstance.as = _chain.as;
  _knexInstance.raw = vi.fn((val: string) => val);
  _knexInstance.transaction = vi.fn();

  return { knexInstance: _knexInstance, chain: _chain };
});

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

describe("GET /parents", () => {
  it("returns list of parents", async () => {
    setResolved([
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Alice Smith",
        email: "alice@example.com",
      },
    ]);

    const res = await request(app).get("/parents");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Alice Smith");
    expect(res.body[0].email).toBe("alice@example.com");
  });
});
