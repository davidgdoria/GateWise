from app.db.session import SessionLocal
from app.models import User, Vehicle, ParkingRecord, Subscription, Payment, Notification, Alert, ParkingSpace
from faker import Faker
from datetime import datetime, timedelta
import random
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
fake = Faker()

def seed_dependent():
    db = SessionLocal()
    try:
        logger.info("Fetching base data...")
        users = db.query(User).filter(User.is_superuser == False).all()
        vehicles = db.query(Vehicle).all()
        parking_spaces = db.query(ParkingSpace).all()

        logger.info("Creating parking records...")
        parking_records = []
        for vehicle in vehicles:
            num_records = random.randint(1, 3)
            for _ in range(num_records):
                entry_time = datetime.now() - timedelta(days=random.randint(0, 30))
                exit_time = entry_time + timedelta(hours=random.randint(1, 48))
                duration = (exit_time - entry_time).total_seconds() / 60
                fee = round(duration * 0.5, 2)
                space = random.choice(parking_spaces)
                record = ParkingRecord(
                    vehicle_id=vehicle.id,
                    space_id=space.id,
                    entry_time=entry_time,
                    exit_time=exit_time,
                    duration_minutes=int(duration),
                    fee=fee,
                    is_paid=random.choice([True, False]),
                    entry_image_path=f"images/entry_{vehicle.id}_{entry_time.strftime('%Y%m%d_%H%M%S')}.jpg",
                    exit_image_path=f"images/exit_{vehicle.id}_{exit_time.strftime('%Y%m%d_%H%M%S')}.jpg",
                    confidence_score=random.uniform(0.8, 1.0)
                )
                db.add(record)
                parking_records.append(record)
        db.commit()
        logger.info(f"Created {len(parking_records)} parking records.")

        logger.info("Creating subscriptions...")
        subscription_types = ["MONTHLY", "QUARTERLY", "ANNUAL"]
        subscriptions = []
        for vehicle in vehicles:
            sub_type = random.choice(subscription_types)
            start_date = datetime.now() - timedelta(days=random.randint(0, 30))
            end_date = start_date + timedelta(days=30 if sub_type == "MONTHLY" else (365 if sub_type == "ANNUAL" else 90))
            subscription = Subscription(
                user_id=random.choice(users).id,
                vehicle_id=vehicle.id,
                type=sub_type,
                start_date=start_date,
                end_date=end_date,
                is_active=random.choice([True, False])
            )
            db.add(subscription)
            subscriptions.append(subscription)
        db.commit()
        logger.info(f"Created {len(subscriptions)} subscriptions.")

        logger.info("Creating payments...")
        payment_statuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"]
        payment_methods = ["credit_card", "debit_card", "bank_transfer"]
        payments = []
        for subscription in subscriptions:
            num_payments = random.randint(1, 2)
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
                payments.append(payment)
        db.commit()
        logger.info(f"Created {len(payments)} payments.")

        logger.info("Creating notifications...")
        notification_types = ["PAYMENT", "SUBSCRIPTION", "ALERT", "SYSTEM"]
        notifications = []
        for user in users:
            num_notifications = random.randint(3, 7)
            for _ in range(num_notifications):
                notification = Notification(
                    user_id=user.id,
                    type=random.choice(notification_types),
                    message=fake.sentence(),
                    is_read=random.choice([True, False])
                )
                db.add(notification)
                notifications.append(notification)
        db.commit()
        logger.info(f"Created {len(notifications)} notifications.")

        logger.info("Creating alerts...")
        alert_types = ["prolonged_stay", "unauthorized_entry", "fraud_detection", "system_error"]
        severities = ["low", "medium", "high"]
        alerts = []
        for record in parking_records:
            if random.random() < 0.2:
                created_at = datetime.now() - timedelta(days=random.randint(0, 30))
                resolved_at = datetime.now() if random.choice([True, False]) else None
                alert = Alert(
                    type=random.choice(alert_types),
                    message=fake.sentence(),
                    severity=random.choice(severities),
                    is_resolved=random.choice([True, False]),
                    created_at=created_at,
                    resolved_at=resolved_at,
                    vehicle_id=record.vehicle_id,
                    parking_record_id=record.id
                )
                db.add(alert)
                alerts.append(alert)
        db.commit()
        logger.info(f"Created {len(alerts)} alerts.")
        logger.info("Dependent seeding complete.")
    except Exception as e:
        logger.error(f"Error in dependent seeding: {str(e)}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_dependent() 