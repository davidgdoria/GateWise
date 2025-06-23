"""add type column to parking_spaces

Revision ID: 20250623_add_type_to_parking_space
Revises: 20250622_add_parking_lots_table
Create Date: 2025-06-23 00:50:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250623_add_type_parking_space'
down_revision = '20250622_add_parking_lots_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum type
    parking_space_type = postgresql.ENUM('regular', 'disabled', 'pregnant', 'ev', name='parkingspacetype')
    parking_space_type.create(op.get_bind(), checkfirst=True)

    # Add column with default 'regular'
    op.add_column('parking_spaces', sa.Column('type', parking_space_type, nullable=False, server_default='regular'))


def downgrade() -> None:
    op.drop_column('parking_spaces', 'type')
    parking_space_type = postgresql.ENUM('regular', 'disabled', 'pregnant', 'ev', name='parkingspacetype')
    parking_space_type.drop(op.get_bind(), checkfirst=True)
