from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.models import Vehicle, Subscription, Payment, Notification
from app.core.security import get_password_hash
import random

def create_mock_data():
    db = SessionLocal()
    try:
        # Create admin user
        admin = User(
            email="admin@gatewise.com",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            is_superuser=True,
            full_name="Admin User"
        )
        db.add(admin)
        db.flush()

        # Create multiple residents
        residents = [
            User(
                email="john.smith@email.com",
                hashed_password=get_password_hash("resident123"),
                is_active=True,
                is_superuser=False,
                full_name="John Smith"
            ),
            User(
                email="sarah.johnson@email.com",
                hashed_password=get_password_hash("resident123"),
                is_active=True,
                is_superuser=False,
                full_name="Sarah Johnson"
            ),
            User(
                email="mike.wilson@email.com",
                hashed_password=get_password_hash("resident123"),
                is_active=True,
                is_superuser=False,
                full_name="Mike Wilson"
            ),
            User(
                email="emma.brown@email.com",
                hashed_password=get_password_hash("resident123"),
                is_active=True,
                is_superuser=False,
                full_name="Emma Brown"
            ),
            User(
                email="david.clark@email.com",
                hashed_password=get_password_hash("resident123"),
                is_active=True,
                is_superuser=False,
                full_name="David Clark"
            )
        ]
        db.add_all(residents)
        db.flush()

        # Create vehicles for residents (some with multiple vehicles)
        vehicles = [
            # John Smith's vehicles
            Vehicle(
                user_id=residents[0].id,
                license_plate="ABC123",
                make="Toyota",
                model="Camry",
                year=2020,
                color="Silver",
                status="active"
            ),
            Vehicle(
                user_id=residents[0].id,
                license_plate="DEF456",
                make="Honda",
                model="CR-V",
                year=2021,
                color="Blue",
                status="active"
            ),
            # Sarah Johnson's vehicles
            Vehicle(
                user_id=residents[1].id,
                license_plate="GHI789",
                make="Tesla",
                model="Model 3",
                year=2022,
                color="White",
                status="active"
            ),
            # Mike Wilson's vehicles
            Vehicle(
                user_id=residents[2].id,
                license_plate="JKL012",
                make="Ford",
                model="F-150",
                year=2019,
                color="Black",
                status="active"
            ),
            Vehicle(
                user_id=residents[2].id,
                license_plate="MNO345",
                make="Chevrolet",
                model="Malibu",
                year=2020,
                color="Red",
                status="inactive"
            ),
            # Emma Brown's vehicle
            Vehicle(
                user_id=residents[3].id,
                license_plate="PQR678",
                make="BMW",
                model="X5",
                year=2021,
                color="Gray",
                status="active"
            ),
            # David Clark's vehicles
            Vehicle(
                user_id=residents[4].id,
                license_plate="STU901",
                make="Audi",
                model="A4",
                year=2022,
                color="Black",
                status="active"
            ),
            Vehicle(
                user_id=residents[4].id,
                license_plate="VWX234",
                make="Mercedes",
                model="C-Class",
                year=2021,
                color="Silver",
                status="active"
            )
        ]
        db.add_all(vehicles)
        db.flush()

        # Create subscriptions with different statuses and types
        subscriptions = []
        for vehicle in vehicles:
            if vehicle.status == "active":
                # Create both monthly and yearly subscriptions for some vehicles
                if random.choice([True, False]):
                    subscriptions.extend([
                        Subscription(
                            user_id=vehicle.user_id,
                            vehicle_id=vehicle.id,
                            plan_type="monthly",
                            start_date=datetime.now() - timedelta(days=random.randint(0, 30)),
                            end_date=datetime.now() + timedelta(days=random.randint(1, 30)),
                            status="active",
                            price=29.99
                        ),
                        Subscription(
                            user_id=vehicle.user_id,
                            vehicle_id=vehicle.id,
                            plan_type="yearly",
                            start_date=datetime.now() - timedelta(days=random.randint(0, 365)),
                            end_date=datetime.now() + timedelta(days=random.randint(1, 365)),
                            status="active",
                            price=299.99
                        )
                    ])
                else:
                    subscriptions.append(
                        Subscription(
                            user_id=vehicle.user_id,
                            vehicle_id=vehicle.id,
                            plan_type=random.choice(["monthly", "yearly"]),
                            start_date=datetime.now() - timedelta(days=random.randint(0, 30)),
                            end_date=datetime.now() + timedelta(days=random.randint(1, 30)),
                            status="active",
                            price=29.99 if random.choice([True, False]) else 299.99
                        )
                    )

        db.add_all(subscriptions)
        db.flush()

        # Create payments for subscriptions
        payments = []
        for subscription in subscriptions:
            # Create multiple payments for each subscription
            num_payments = random.randint(1, 3)
            for i in range(num_payments):
                payment_date = subscription.start_date + timedelta(days=i * 30)
                payments.append(
                    Payment(
                        user_id=subscription.user_id,
                        subscription_id=subscription.id,
                        amount=subscription.price,
                        payment_date=payment_date,
                        payment_method=random.choice(["credit_card", "debit_card", "bank_transfer"]),
                        status="completed"
                    )
                )

        db.add_all(payments)

        # Create notifications for various events
        notifications = []
        for resident in residents:
            # Welcome notification
            notifications.append(
                Notification(
                    user_id=resident.id,
                    title="Welcome to GateWise",
                    message="Thank you for joining our parking management system!",
                    type="info",
                    is_read=False,
                    created_at=datetime.now() - timedelta(days=random.randint(1, 30))
                )
            )
            
            # Subscription notifications
            notifications.append(
                Notification(
                    user_id=resident.id,
                    title="Subscription Renewal",
                    message="Your parking subscription will renew in 7 days.",
                    type="warning",
                    is_read=False,
                    created_at=datetime.now() - timedelta(days=random.randint(1, 7))
                )
            )
            
            # Maintenance notifications
            if random.choice([True, False]):
                notifications.append(
                    Notification(
                        user_id=resident.id,
                        title="Parking Maintenance",
                        message="Scheduled maintenance in P2 level this weekend.",
                        type="warning",
                        is_read=False,
                        created_at=datetime.now() - timedelta(days=random.randint(1, 14))
                    )
                )

        db.add_all(notifications)

        db.commit()
        print("Mock data created successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error creating mock data: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    create_mock_data() 