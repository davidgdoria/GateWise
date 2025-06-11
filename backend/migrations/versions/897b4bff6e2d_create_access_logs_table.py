"""create access_logs table

Revision ID: 897b4bff6e2d
Revises: 
Create Date: 2025-06-11 16:32:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '897b4bff6e2d'
down_revision = 'ccedc4a2e8b1'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'access_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('license_plate', sa.String(), nullable=False, index=True),
        sa.Column('vehicle_id', sa.Integer(), sa.ForeignKey('vehicles.id'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('granted', sa.Boolean(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.func.now(), nullable=False)
    )

def downgrade():
    op.drop_table('access_logs')
