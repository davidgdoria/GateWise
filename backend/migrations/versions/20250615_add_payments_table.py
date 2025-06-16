"""
add payments table
Revision ID: 20250615_add_payments_table
Revises: ccedc4a2e8b1_add_price_at_subscription_and_end_date_not_null
Create Date: 2025-06-15 16:22:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250615_add_payments_table'
down_revision = 'ccedc4a2e8b1'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('subscription_id', sa.Integer(), sa.ForeignKey('subscriptions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('paid_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('status', sa.String(), nullable=False, server_default='paid'),
    )

def downgrade():
    op.drop_table('payments')
