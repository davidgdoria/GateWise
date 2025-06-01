from app.db.session import SessionLocal
from app.models import User, Vehicle, ParkingRecord, Subscription, Payment, Notification, Alert
from app.core.security import get_password_hash
from faker import Faker
from datetime import datetime, timedelta
import random

fake = Faker()

def seed():
    db = SessionLocal()
    try:
        # Optionally: Clear all data first
        db.query(Alert).delete()
        db.query(Notification).delete()
        db.query(Payment).delete()
        db.query(Subscription).delete()
        db.query(ParkingRecord).delete()
        db.query(Vehicle).delete()
        db.query(User).delete()
        db.commit()

        # Create admin user
        admin = User(
            email='admin@gatewise.com',
            hashed_password=get_password_hash("admin123"),
            full_name='Admin User',
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()

        # Create 50 residents
        residents = []
        for _ in range(50):
            resident = User(
                email=fake.email(),
                hashed_password=get_password_hash("resident123"),
                full_name=fake.name(),
                is_active=True,
                is_superuser=False
            )
            db.add(resident)
            residents.append(resident)
        db.commit()

        # Create vehicles
        vehicle_makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Audi", "Tesla", "Hyundai", "Kia"]
        vehicle_models = {
            "Toyota": ["Camry", "Corolla", "RAV4", "Highlander"],
            "Honda": ["Civic", "Accord", "CR-V", "Pilot"],
            "Ford": ["F-150", "Mustang", "Explorer", "Escape"],
            "Chevrolet": ["Malibu", "Silverado", "Equinox", "Tahoe"],
            "BMW": ["3 Series", "5 Series", "X3", "X5"],
            "Mercedes": ["C-Class", "E-Class", "GLC", "GLE"],
            "Audi": ["A4", "A6", "Q5", "Q7"],
            "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
            "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe"],
            "Kia": ["Forte", "Optima", "Sportage", "Sorento"]
        }
        colors = ["Silver", "Black", "White", "Blue", "Red", "Gray", "Green", "Brown"]

        vehicles = []
        for resident in residents:
            num_vehicles = random.randint(1, 6)
            for _ in range(num_vehicles):
                make = random.choice(vehicle_makes)
                model = random.choice(vehicle_models[make])
                vehicle = Vehicle(
                    license_plate=fake.license_plate(),
                    make=make,
                    model=model,
                    color=random.choice(colors),
                    is_authorized=True
                )
                db.add(vehicle)
                vehicles.append(vehicle)
        db.commit()

        # Create parking records
        for vehicle in vehicles:
            num_records = random.randint(1, 5)
            for _ in range(num_records):
                entry_time = datetime.now() - timedelta(days=random.randint(0, 30))
                exit_time = entry_time + timedelta(hours=random.randint(1, 48))
                duration = (exit_time - entry_time).total_seconds() / 60
                fee = round(duration * 0.5, 2)  # $0.50 per minute
                parking_record = ParkingRecord(
                    vehicle_id=vehicle.id,
                    entry_time=entry_time,
                    exit_time=exit_time,
                    duration_minutes=int(duration),
                    fee=fee,
                    is_paid=random.choice([True, False]),
                    entry_image_path=f"images/entry_{vehicle.id}_{entry_time.strftime('%Y%m%d_%H%M%S')}.jpg",
                    exit_image_path=f"images/exit_{vehicle.id}_{exit_time.strftime('%Y%m%d_%H%M%S')}.jpg",
                    confidence_score=random.uniform(0.8, 1.0)
                )
                db.add(parking_record)
        db.commit()

        # Create subscriptions
        subscription_types = ["MONTHLY", "QUARTERLY", "ANNUAL"]
        for vehicle in vehicles:
            num_subscriptions = random.randint(1, 3)
            for _ in range(num_subscriptions):
                sub_type = random.choice(subscription_types)
                start_date = datetime.now() - timedelta(days=random.randint(0, 30))
                end_date = start_date + timedelta(
                    days=30 if sub_type == "MONTHLY" else (365 if sub_type == "ANNUAL" else 90)
                )
                subscription = Subscription(
                    user_id=random.choice(residents).id,
                    vehicle_id=vehicle.id,
                    type=sub_type,
                    start_date=start_date,
                    end_date=end_date,
                    is_active=random.choice([True, False])
                )
                db.add(subscription)
        db.commit()

        # Create payments
        payment_statuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"]
        payment_methods = ["credit_card", "debit_card", "bank_transfer"]
        for subscription in db.query(Subscription).all():
            num_payments = random.randint(1, 5)
            for _ in range(num_payments):
                payment = Payment(
                    user_id=subscription.user_id,
                    subscription_id=subscription.id,
                    amount=random.uniform(10.0, 500.0),
                    status=random.choice(payment_statuses),
                    payment_method=random.choice(payment_methods),
                    transaction_id=fake.uuid4()
                )
                db.add(payment)
        db.commit()

        # Create notifications
        notification_types = ["SYSTEM", "PAYMENT", "PARKING", "SECURITY"]
        for resident in residents:
            num_notifications = random.randint(3, 10)
            for _ in range(num_notifications):
                notification = Notification(
                    user_id=resident.id,
                    type=random.choice(notification_types),
                    message=fake.sentence(),
                    is_read=random.choice([True, False])
                )
                db.add(notification)
        db.commit()

        # Create alerts
        alert_types = ["prolonged_stay", "unauthorized_entry", "fraud_detection", "system_error"]
        severities = ["low", "medium", "high"]
        for parking_record in db.query(ParkingRecord).all():
            if random.random() < 0.2:  # 20% chance of creating an alert
                created_at = datetime.now() - timedelta(days=random.randint(0, 30))
                resolved_at = datetime.now() if random.choice([True, False]) else None
                alert = Alert(
                    type=random.choice(alert_types),
                    message=fake.sentence(),
                    severity=random.choice(severities),
                    is_resolved=random.choice([True, False]),
                    created_at=created_at,
                    resolved_at=resolved_at,
                    vehicle_id=parking_record.vehicle_id,
                    parking_record_id=parking_record.id
                )
                db.add(alert)
        db.commit()

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed() 