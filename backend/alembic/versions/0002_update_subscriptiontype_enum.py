"""
Alembic migration to ensure 'subscriptiontype' enum includes all required values (monthly, quarterly, annual) in lowercase.
This is safe to run multiple times and will not fail if the value already exists.
"""
from alembic import op

def upgrade():
    op.execute("ALTER TYPE subscriptiontype ADD VALUE IF NOT EXISTS 'monthly';")
    op.execute("ALTER TYPE subscriptiontype ADD VALUE IF NOT EXISTS 'quarterly';")
    op.execute("ALTER TYPE subscriptiontype ADD VALUE IF NOT EXISTS 'annual';")

def downgrade():
    # Can't remove values from a PostgreSQL enum; downgrade does nothing.
    pass
