"""add parking_spaces table

Revision ID: add_parking_spaces_table
Revises: abab8284f95a
Create Date: 2025-06-10 18:13:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_parking_spaces_table'
down_revision = 'add_full_name_and_email_to_user'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'parking_spaces',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('description', sa.String),
        sa.Column('is_allocated', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('is_occupied', sa.Boolean, nullable=False, server_default=sa.text('false')),
    )

def downgrade():
    op.drop_table('parking_spaces')
