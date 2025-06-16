"""
Alembic migration for plans, subscriptions, and subscription_parking_spaces tables
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f7'
down_revision = 'c1d2e3f4g5h6'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'plans',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('num_spaces', sa.Integer(), nullable=False),
        sa.Column('description', sa.String()),
        sa.Column('duration_days', sa.Integer(), nullable=False),
        sa.Column('active', sa.Integer(), default=1)
    )
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('plan_id', sa.Integer(), sa.ForeignKey('plans.id'), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime()),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('cancellation_date', sa.DateTime(), nullable=True)
    )
    op.create_table(
        'subscription_parking_spaces',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('subscription_id', sa.Integer(), sa.ForeignKey('subscriptions.id'), nullable=False),
        sa.Column('parking_space_id', sa.Integer(), sa.ForeignKey('parking_spaces.id'), nullable=False)
    )

def downgrade():
    op.drop_table('subscription_parking_spaces')
    op.drop_table('subscriptions')
    op.drop_table('plans')
