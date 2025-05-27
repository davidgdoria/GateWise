import os
import subprocess
from app.core.config import settings

def setup_cron_job():
    """Set up a cron job for database backups."""
    # Get the backup schedule from settings
    schedule = settings.BACKUP_SCHEDULE
    
    # Create the cron command
    cron_cmd = f"{schedule} cd /app && python scripts/backup_db.py >> /var/log/cron.log 2>&1"
    
    # Add the cron job
    try:
        # Create a temporary file with the cron job
        with open('/tmp/crontab', 'w') as f:
            f.write(cron_cmd + '\n')
        
        # Install the cron job
        subprocess.run(['crontab', '/tmp/crontab'], check=True)
        print(f"Backup cron job installed with schedule: {schedule}")
        
        # Start the cron service
        subprocess.run(['service', 'cron', 'start'], check=True)
        print("Cron service started")
        
    except subprocess.CalledProcessError as e:
        print(f"Error setting up cron job: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    setup_cron_job() 