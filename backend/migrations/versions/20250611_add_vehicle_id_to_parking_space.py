"""
add vehicle_id to parking_space
Revision ID: 20250611_add_vehicle_id_to_parking_space
Revises: 
Create Date: 2025-06-11 21:24:30.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e1a2b3c4d5f6'
down_revision = 'add_vehicle_type_column'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('parking_spaces', sa.Column('vehicle_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_parking_spaces_vehicle_id_vehicles',
        'parking_spaces', 'vehicles',
        ['vehicle_id'], ['id'],
        ondelete='SET NULL'
    )

def downgrade():
    op.drop_constraint('fk_parking_spaces_vehicle_id_vehicles', 'parking_spaces', type_='foreignkey')
    op.drop_column('parking_spaces', 'vehicle_id')
