"""
Alembic migration for token_blacklist table
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c1d2e3f4g5h6'
down_revision = 'add_parking_spaces_table'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'token_blacklist',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('jti', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('blacklisted_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('token_blacklist')
