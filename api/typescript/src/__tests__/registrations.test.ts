import request from "supertest";
import { vi } from "vitest";

let resolvedValue: any = undefined;

const { knexInstance, chain } = vi.hoisted(() => {
  const _chain: any = {};
  const methods = [
    "select", "where", "andWhere", "orderBy", "join",
    "first", "insert", "update", "count", "onConflict", "merge",
    "del", "from", "forUpdate",
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

function createTrxMock() {
  const trxChain: any = {};
  let trxResolved: any = undefined;
  const trxMethods = [
    "select", "where", "andWhere", "orderBy", "join",
    "insert", "update", "count", "onConflict", "merge",
    "del", "from", "forUpdate",
  ];
  for (const m of trxMethods) {
    trxChain[m] = vi.fn(() => trxChain);
  }
  trxChain.first = vi.fn(() => trxChain);
  trxChain.then = function (resolve: any, reject: any) {
    return Promise.resolve(trxResolved).then(resolve, reject);
  };

  const trx: any = vi.fn(() => trxChain);
  for (const m of Object.keys(trxChain)) {
    trx[m] = trxChain[m];
  }

  return {
    trx,
    trxChain,
    setTrxResolved: (val: any) => { trxResolved = val; },
  };
}

describe("GET /registrations", () => {
  it("requires parentId", async () => {
    const res = await request(app).get("/registrations");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("parentId required");
  });

  it("returns registrations for a parent", async () => {
    setResolved([
      {
        id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr",
        class_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        status: "registered",
        class_name: "Piano",
      },
    ]);

    const res = await request(app).get(
      "/registrations?parentId=11111111-1111-1111-1111-111111111111"
    );
    expect(res.status).toBe(200);
    expect(res.body.registrations).toHaveLength(1);
    expect(res.body.registrations[0].class_name).toBe("Piano");
  });
});

describe("GET /registrations/all", () => {
  it("returns all registrations", async () => {
    setResolved([
      {
        id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr",
        class_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        class_name: "Piano",
        parent_name: "Alice Smith",
        parent_email: "alice@example.com",
        created_at: "2025-01-01T00:00:00.000Z",
      },
    ]);

    const res = await request(app).get("/registrations/all");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].class_name).toBe("Piano");
    expect(res.body[0].parent_name).toBe("Alice Smith");
  });
});

describe("POST /registrations", () => {
  it("requires classId and parentId", async () => {
    const res = await request(app).post("/registrations").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("classId and parentId required");
  });

  it("returns 404 when class not found", async () => {
    knexInstance.transaction.mockImplementation(async (cb: any) => {
      const { trx, setTrxResolved } = createTrxMock();
      setTrxResolved(undefined); // first() returns undefined = class not found
      return cb(trx);
    });

    const res = await request(app).post("/registrations").send({
      classId: "00000000-0000-0000-0000-000000000000",
      parentId: "11111111-1111-1111-1111-111111111111",
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Class not found");
  });

  it("registers successfully", async () => {
    knexInstance.transaction.mockImplementation(async (cb: any) => {
      let firstCallCount = 0;
      const trxChain: any = {};
      let trxResolved: any = undefined;
      const trxMethods = [
        "select", "where", "andWhere", "orderBy", "join",
        "insert", "update", "count", "onConflict", "merge",
        "del", "from", "forUpdate",
      ];
      for (const m of trxMethods) {
        trxChain[m] = vi.fn(() => trxChain);
      }
      trxChain.first = vi.fn(() => {
        firstCallCount++;
        if (firstCallCount === 1) {
          trxResolved = { capacity: 20 };
        } else if (firstCallCount === 2) {
          trxResolved = { count: "5" };
        }
        return trxChain;
      });
      trxChain.then = function (resolve: any, reject: any) {
        return Promise.resolve(trxResolved).then(resolve, reject);
      };
      const trx: any = vi.fn(() => {
        trxResolved = undefined;
        return trxChain;
      });
      for (const m of Object.keys(trxChain)) {
        trx[m] = trxChain[m];
      }
      return cb(trx);
    });

    const res = await request(app).post("/registrations").send({
      classId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      parentId: "33333333-3333-3333-3333-333333333333",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("registered");
    expect(res.body.message).toBe("Successfully registered for class");
  });

  it("returns 409 when class is full", async () => {
    knexInstance.transaction.mockImplementation(async (cb: any) => {
      let firstCallCount = 0;
      const trxChain: any = {};
      let trxResolved: any = undefined;
      const trxMethods = [
        "select", "where", "andWhere", "orderBy", "join",
        "insert", "update", "count", "onConflict", "merge",
        "del", "from", "forUpdate",
      ];
      for (const m of trxMethods) {
        trxChain[m] = vi.fn(() => trxChain);
      }
      trxChain.first = vi.fn(() => {
        firstCallCount++;
        if (firstCallCount === 1) {
          trxResolved = { capacity: 2 };
        } else if (firstCallCount === 2) {
          trxResolved = { count: "2" };
        }
        return trxChain;
      });
      trxChain.then = function (resolve: any, reject: any) {
        return Promise.resolve(trxResolved).then(resolve, reject);
      };
      const trx: any = vi.fn(() => {
        trxResolved = undefined;
        return trxChain;
      });
      for (const m of Object.keys(trxChain)) {
        trx[m] = trxChain[m];
      }
      return cb(trx);
    });

    const res = await request(app).post("/registrations").send({
      classId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      parentId: "33333333-3333-3333-3333-333333333333",
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Class is full");
  });
});

describe("DELETE /registrations/:id", () => {
  it("returns 404 when registration not found", async () => {
    setResolved(undefined);

    const res = await request(app).delete(
      "/registrations/00000000-0000-0000-0000-000000000000"
    );
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Registration not found");
  });

  it("cancels a registration", async () => {
    setResolved({ id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr", status: "registered" });

    const res = await request(app).delete(
      "/registrations/rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr"
    );
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Registration cancelled");
  });
});
