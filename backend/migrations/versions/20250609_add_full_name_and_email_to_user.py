"""
Add full_name and email columns to users table

Revision ID: add_full_name_and_email_to_user
Revises: 
Create Date: 2025-06-09 00:20:30
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_full_name_and_email_to_user'
down_revision = 'abab8284f95a'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=False, server_default='admin'))
    op.add_column('users', sa.Column('email', sa.String(), nullable=False, unique=True, server_default='admin@example.com'))
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

def downgrade():
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_column('users', 'email')
    op.drop_column('users', 'full_name')
