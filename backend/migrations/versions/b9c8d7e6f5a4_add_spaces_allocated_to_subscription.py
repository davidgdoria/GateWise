"""
Add spaces_allocated field to subscriptions
Revision ID: b9c8d7e6f5a4
Revises: a1b2c3d4e5f7
Create Date: 2025-06-11 12:35:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b9c8d7e6f5a4'
down_revision = 'a1b2c3d4e5f7'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('subscriptions', sa.Column('spaces_allocated', sa.Integer(), nullable=False, server_default='1'))
    op.alter_column('subscriptions', 'spaces_allocated', server_default=None)

def downgrade():
    op.drop_column('subscriptions', 'spaces_allocated')
