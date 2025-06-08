"""create initial schema

Revision ID: 0001_create_initial_schema
Revises: 
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_create_initial_schema"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # Create parking_spaces table
    op.create_table(
        "parking_spaces",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("is_occupied", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_reserved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_parking_spaces_name"), "parking_spaces", ["name"], unique=True)

    # Create vehicles table
    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("license_plate", sa.String(), nullable=False),
        sa.Column("make", sa.String(), nullable=True),
        sa.Column("model", sa.String(), nullable=True),
        sa.Column("color", sa.String(), nullable=True),
        sa.Column("is_authorized", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_vehicles_license_plate"), "vehicles", ["license_plate"], unique=True)

    # Create notifications table
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.Enum("payment", "subscription", "alert", "system", "parking", name="notificationtype"), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id")
    )

    # Create parking_records table
    op.create_table(
        "parking_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("space_id", sa.Integer(), nullable=False),
        sa.Column("entry_time", sa.DateTime(), nullable=False),
        sa.Column("exit_time", sa.DateTime(), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("fee", sa.Float(), nullable=True),
        sa.Column("is_paid", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("entry_image_path", sa.String(), nullable=True),
        sa.Column("exit_image_path", sa.String(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ),
        sa.ForeignKeyConstraint(["space_id"], ["parking_spaces.id"], ),
        sa.PrimaryKeyConstraint("id")
    )

    # Create subscriptions table
    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.Enum("monthly", "quarterly", "annual", name="subscriptiontype"), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ),
        sa.PrimaryKeyConstraint("id")
    )

    # Create alerts table
    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("severity", sa.String(), nullable=False),
        sa.Column("is_resolved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column("vehicle_id", sa.Integer(), nullable=True),
        sa.Column("parking_record_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["parking_record_id"], ["parking_records.id"], ),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ),
        sa.PrimaryKeyConstraint("id")
    )

    # Create payments table
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("subscription_id", sa.Integer(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("status", sa.Enum("pending", "completed", "failed", "refunded", name="paymentstatus"), nullable=False),
        sa.Column("payment_method", sa.String(), nullable=False),
        sa.Column("transaction_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["subscription_id"], ["subscriptions.id"], ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("transaction_id")
    )

def downgrade():
    op.drop_table("payments")
    op.drop_table("alerts")
    op.drop_table("subscriptions")
    op.drop_table("parking_records")
    op.drop_table("notifications")
    op.drop_table("vehicles")
    op.drop_table("parking_spaces")
    op.drop_table("users") 