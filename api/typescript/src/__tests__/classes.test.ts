import request from "supertest";
import app from "../app";
import { pool } from "../db";
import { vi } from "vitest";

vi.mock("../db", () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}));

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

afterEach(() => vi.clearAllMocks());

describe("GET /classes", () => {
  it("returns list of classes", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          name: "Piano",
          capacity: 2,
          registered_count: "2",
        },
      ],
    });

    const res = await request(app).get("/classes");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Piano");
    expect(res.body[0].capacity).toBe(2);
  });
});

describe("GET /classes/:id", () => {
  it("returns a single class", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          name: "Piano",
          capacity: 2,
          registered_count: "2",
        },
      ],
    });

    const res = await request(app).get(
      "/classes/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
    );
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Piano");
  });

  it("returns 404 when class not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get(
      "/classes/00000000-0000-0000-0000-000000000000"
    );
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Class not found");
  });
});
