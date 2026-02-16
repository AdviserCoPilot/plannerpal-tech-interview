import os

import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://atlas:atlas@localhost:5432/atlas_academy"
)


def get_pool():
    return psycopg2.connect(DATABASE_URL)


def get_cursor():
    conn = get_pool()
    conn.autocommit = False
    return conn, conn.cursor(cursor_factory=RealDictCursor)


def query(sql, params=None):
    conn = get_pool()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            if cur.description:
                return cur.fetchall()
            return []
    finally:
        conn.close()


def execute(sql, params=None):
    conn = get_pool()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
    finally:
        conn.close()
