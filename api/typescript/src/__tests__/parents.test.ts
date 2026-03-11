import request from "supertest";
import app from "../app";
import { pool } from "../db";
import { vi } from "vitest";

vi.mock("../db", () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}));

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

afterEach(() => vi.clearAllMocks());

describe("GET /parents", () => {
  it("returns list of parents", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Alice Smith",
          email: "alice@example.com",
        },
      ],
    });

    const res = await request(app).get("/parents");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Alice Smith");
    expect(res.body[0].email).toBe("alice@example.com");
  });
});
