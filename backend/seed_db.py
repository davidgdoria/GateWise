from app.db.session import SessionLocal
from app.models import User, Vehicle, ParkingRecord, Subscription, Payment, Notification, Alert, ParkingSpace
from app.core.security import get_password_hash
from faker import Faker
from datetime import datetime, timedelta
import random
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker()

def seed():
    db = SessionLocal()
    try:
        logger.info("Starting database seeding...")
        
        # Optionally: Clear all data first
        logger.info("Clearing existing data...")
        db.query(Alert).delete()
        db.query(Notification).delete()
        db.query(Payment).delete()
        db.query(Subscription).delete()
        db.query(ParkingRecord).delete()
        db.query(Vehicle).delete()
        db.query(User).delete()
        db.query(ParkingSpace).delete()
        db.commit()
        logger.info("Existing data cleared successfully")

        # Create admin user
        logger.info("Creating admin user...")
        admin = User(
            email='admin@gatewise.com',
            hashed_password=get_password_hash("admin123"),
            full_name='Admin User',
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()
        logger.info("Admin user created successfully")

        # Create 50 residents
        logger.info("Creating residents...")
        residents = []
        for i in range(50):
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
        logger.info(f"Created {len(residents)} residents successfully")

        # Create parking spaces
        logger.info("Creating parking spaces...")
        parking_spaces = []
        for row in ['A', 'B', 'C', 'D', 'E']:
            for num in range(1, 4):
                name = f"{row}{num}"
                space = ParkingSpace(
                    name=name,
                    is_occupied=False,
                    is_reserved=False
                )
                db.add(space)
                parking_spaces.append(space)
        db.commit()
        logger.info(f"Created {len(parking_spaces)} parking spaces successfully")
        
        # Fetch all parking spaces from the DB to ensure correct IDs
        parking_spaces = db.query(ParkingSpace).all()
        logger.info(f"Retrieved {len(parking_spaces)} parking spaces from database")

        # Create vehicles
        logger.info("Creating vehicles...")
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
        logger.info(f"Created {len(vehicles)} vehicles successfully")

        # Create parking records
        logger.info("Creating parking records...")
        for vehicle in vehicles:
            num_records = random.randint(1, 5)
            for _ in range(num_records):
                entry_time = datetime.now() - timedelta(days=random.randint(0, 30))
                exit_time = entry_time + timedelta(hours=random.randint(1, 48))
                duration = (exit_time - entry_time).total_seconds() / 60
                fee = round(duration * 0.5, 2)  # $0.50 per minute
                # Assign a random parking space
                space = random.choice(parking_spaces)
                try:
                    # Create parking record using raw SQL
                    db.execute(
                        """
                        INSERT INTO parking_records 
                        (vehicle_id, space_id, entry_time, exit_time, duration_minutes, fee, is_paid, 
                        entry_image_path, exit_image_path, confidence_score, created_at, updated_at)
                        VALUES 
                        (:vehicle_id, :space_id, :entry_time, :exit_time, :duration_minutes, :fee, :is_paid,
                        :entry_image_path, :exit_image_path, :confidence_score, :created_at, :updated_at)
                        """,
                        {
                            "vehicle_id": vehicle.id,
                            "space_id": space.id,
                            "entry_time": entry_time,
                            "exit_time": exit_time,
                            "duration_minutes": int(duration),
                            "fee": fee,
                            "is_paid": random.choice([True, False]),
                            "entry_image_path": f"images/entry_{vehicle.id}_{entry_time.strftime('%Y%m%d_%H%M%S')}.jpg",
                            "exit_image_path": f"images/exit_{vehicle.id}_{exit_time.strftime('%Y%m%d_%H%M%S')}.jpg",
                            "confidence_score": random.uniform(0.8, 1.0),
                            "created_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                    )
                    
                    # Update parking space status
                    space.is_occupied = True
                    db.flush()  # Flush the space update
                    
                    # Commit both changes
                    db.commit()
                    logger.info(f"Created parking record for vehicle {vehicle.id} in space {space.id}")
                except Exception as e:
                    logger.error(f"Error creating parking record: {str(e)}")
                    db.rollback()
                    raise e
        logger.info("Parking records created successfully")

        # Create subscriptions
        logger.info("Creating subscriptions...")
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
        logger.info("Subscriptions created successfully")

        # Create payments
        logger.info("Creating payments...")
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
        logger.info("Payments created successfully")

        # Create notifications
        logger.info("Creating notifications...")
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
        logger.info("Notifications created successfully")

        # Create alerts
        logger.info("Creating alerts...")
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
        logger.info("Alerts created successfully")
        logger.info("Database seeding completed successfully!")

    except Exception as e:
        logger.error(f"Error creating mock data: {str(e)}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed() 