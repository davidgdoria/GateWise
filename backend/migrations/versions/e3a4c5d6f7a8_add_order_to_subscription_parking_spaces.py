"""
Add order column to subscription_parking_spaces

Revision ID: e3a4c5d6f7a8
Revises: 20250615_merge_heads
Create Date: 2025-06-16 22:54:41.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e3a4c5d6f7a8'
down_revision = '20250615_merge_heads'
table_name = 'subscription_parking_spaces'


def upgrade():
    # 1. Adiciona a coluna como nullable e default 0
    op.add_column(table_name, sa.Column('order', sa.Integer(), nullable=True, server_default='0'))
    # 2. Atualiza todos os registos antigos (se existirem)
    op.execute(f'UPDATE {table_name} SET "order" = 0 WHERE "order" IS NULL')
    # 3. Torna a coluna NOT NULL e remove o default
    op.alter_column(table_name, 'order', nullable=False, server_default=None)

def downgrade():
    op.drop_column(table_name, 'order')
