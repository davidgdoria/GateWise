"""
Add parking_lots table

Revision ID: 20250622_add_parking_lots_table
Revises: e3a4c5d6f7a8
Create Date: 2025-06-22 15:40:45
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250622_add_parking_lots_table'
down_revision = 'e3a4c5d6f7a8'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'parking_lots',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('total_spaces', sa.Integer(), nullable=False),
    )


def downgrade():
    op.drop_table('parking_lots')
