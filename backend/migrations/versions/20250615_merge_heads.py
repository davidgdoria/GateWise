"""merge heads

Revision ID: 20250615_merge_heads
Revises: 20250615_add_payments_table, e1a2b3c4d5f6
Create Date: 2025-06-15 16:40:00
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250615_merge_heads'
down_revision = ('20250615_add_payments_table', 'e1a2b3c4d5f6')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass
