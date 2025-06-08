from app.db.session import SessionLocal
from app.models import User, Vehicle, ParkingSpace
from app.core.security import get_password_hash
from faker import Faker
import random
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
fake = Faker()

def seed_base():
    db = SessionLocal()
    try:
        logger.info("Clearing existing base data...")
        db.query(Vehicle).delete()
        db.query(User).delete()
        db.query(ParkingSpace).delete()
        db.commit()

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

        logger.info("Creating 100 residents...")
        residents = []
        for _ in range(100):
            resident = User(
                email=fake.unique.email(),
                hashed_password=get_password_hash("resident123"),
                full_name=fake.name(),
                is_active=True,
                is_superuser=False
            )
            db.add(resident)
            residents.append(resident)
        db.commit()
        logger.info(f"Created {len(residents)} residents.")

        logger.info("Creating 100 parking spaces...")
        parking_spaces = []
        for i in range(1, 101):
            name = f"P{i:03d}"
            space = ParkingSpace(
                name=name,
                is_occupied=False,
                is_reserved=False
            )
            db.add(space)
            parking_spaces.append(space)
        db.commit()
        logger.info(f"Created {len(parking_spaces)} parking spaces.")

        logger.info("Creating 300 vehicles...")
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
        all_users = db.query(User).filter(User.is_superuser == False).all()
        for _ in range(300):
            owner = random.choice(all_users)
            make = random.choice(vehicle_makes)
            model = random.choice(vehicle_models[make])
            vehicle = Vehicle(
                license_plate=fake.unique.license_plate(),
                make=make,
                model=model,
                color=random.choice(colors),
                is_authorized=True
            )
            db.add(vehicle)
            vehicles.append(vehicle)
        db.commit()
        logger.info(f"Created {len(vehicles)} vehicles.")
        logger.info("Base seeding complete.")
    except Exception as e:
        logger.error(f"Error in base seeding: {str(e)}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_base() 