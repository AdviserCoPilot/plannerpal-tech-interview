import request from "supertest";
import app from "../app";
import { pool } from "../db";
import { vi } from "vitest";

vi.mock("../db", () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}));

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const mockConnect = pool.connect as ReturnType<typeof vi.fn>;

afterEach(() => vi.clearAllMocks());

describe("GET /registrations", () => {
  it("requires parentId", async () => {
    const res = await request(app).get("/registrations");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("parentId required");
  });

  it("returns registrations for a parent", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr",
          class_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          status: "registered",
          class_name: "Piano",
        },
      ],
    });

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
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr",
          class_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          class_name: "Piano",
          parent_name: "Alice Smith",
          parent_email: "alice@example.com",
          created_at: "2025-01-01T00:00:00.000Z",
        },
      ],
    });

    const res = await request(app).get("/registrations/all");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].class_name).toBe("Piano");
    expect(res.body[0].parent_name).toBe("Alice Smith");
  });
});

describe("POST /registrations", () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    mockConnect.mockResolvedValue(mockClient);
  });

  it("requires classId and parentId", async () => {
    const res = await request(app).post("/registrations").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("classId and parentId required");
  });

  it("returns 404 when class not found", async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/registrations").send({
      classId: "00000000-0000-0000-0000-000000000000",
      parentId: "11111111-1111-1111-1111-111111111111",
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Class not found");
  });

  it("registers successfully", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ capacity: 20 }] })
      .mockResolvedValueOnce({ rows: [{ count: "5" }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/registrations").send({
      classId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      parentId: "33333333-3333-3333-3333-333333333333",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("registered");
    expect(res.body.message).toBe("Successfully registered for class");
  });

  it("returns 409 when class is full", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [{ capacity: 2 }] })
      .mockResolvedValueOnce({ rows: [{ count: "2" }] });

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
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete(
      "/registrations/00000000-0000-0000-0000-000000000000"
    );
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Registration not found");
  });

  it("cancels a registration", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ id: "rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr", status: "registered" }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete(
      "/registrations/rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr"
    );
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Registration cancelled");
  });
});
