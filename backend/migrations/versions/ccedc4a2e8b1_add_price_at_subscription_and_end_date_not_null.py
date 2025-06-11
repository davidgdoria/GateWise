"""
Add price_at_subscription (float) and make end_date not null in subscriptions
Revision ID: ccedc4a2e8b1
Revises: b9c8d7e6f5a4
Create Date: 2025-06-11 12:42:00
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ccedc4a2e8b1'
down_revision = 'b9c8d7e6f5a4'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('subscriptions', sa.Column('price_at_subscription', sa.Float(), nullable=False, server_default='0'))
    op.alter_column('subscriptions', 'end_date', nullable=False)
    op.alter_column('subscriptions', 'price_at_subscription', server_default=None)

def downgrade():
    op.drop_column('subscriptions', 'price_at_subscription')
    op.alter_column('subscriptions', 'end_date', nullable=True)
