"""Add class management columns

Revision ID: 002
Revises: 001
Create Date: 2025-03-01
"""

from alembic import op

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE classes ADD COLUMN IF NOT EXISTS instructor_name TEXT")
    op.execute("ALTER TABLE classes ADD COLUMN IF NOT EXISTS location TEXT")


def downgrade() -> None:
    op.execute("ALTER TABLE classes DROP COLUMN IF EXISTS location")
    op.execute("ALTER TABLE classes DROP COLUMN IF EXISTS instructor_name")
