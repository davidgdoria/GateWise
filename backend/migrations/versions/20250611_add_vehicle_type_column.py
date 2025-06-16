"""add type column to vehicles table

Revision ID: add_vehicle_type_column
Revises: 897b4bff6e2d
Create Date: 2025-06-11 17:25:30

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_vehicle_type_column'
down_revision = '897b4bff6e2d'
branch_labels = None
depends_on = None

vehicle_type_enum = sa.Enum('car', 'motorcycle', name='vehicletype')

def upgrade():
    vehicle_type_enum.create(op.get_bind(), checkfirst=True)
    op.add_column('vehicles', sa.Column('type', vehicle_type_enum, nullable=False, server_default='car'))
    op.alter_column('vehicles', 'type', server_default=None)

def downgrade():
    op.drop_column('vehicles', 'type')
    vehicle_type_enum.drop(op.get_bind(), checkfirst=True)
