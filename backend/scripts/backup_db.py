import os
import subprocess
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

def create_backup_filename():
    """Create a backup filename with timestamp."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return f"gatewise_backup_{timestamp}.sql"

def backup_to_local(filename):
    """Create a local backup of the database."""
    backup_dir = "backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    backup_path = os.path.join(backup_dir, filename)
    
    # Construct the pg_dump command
    cmd = [
        "pg_dump",
        f"--host={settings.POSTGRES_SERVER}",
        f"--port=5432",
        f"--username={settings.POSTGRES_USER}",
        f"--dbname={settings.POSTGRES_DB}",
        f"--file={backup_path}"
    ]
    
    # Set PGPASSWORD environment variable
    env = os.environ.copy()
    env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
    
    try:
        subprocess.run(cmd, env=env, check=True)
        print(f"Local backup created successfully: {backup_path}")
        return backup_path
    except subprocess.CalledProcessError as e:
        print(f"Error creating local backup: {e}")
        return None

def backup_to_s3(local_backup_path):
    """Upload the backup to S3."""
    if not all([settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, settings.AWS_BUCKET_NAME]):
        print("AWS credentials not configured. Skipping S3 backup.")
        return False
    
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    
    try:
        s3_client.upload_file(
            local_backup_path,
            settings.AWS_BUCKET_NAME,
            f"database_backups/{os.path.basename(local_backup_path)}"
        )
        print(f"Backup uploaded to S3 successfully: {os.path.basename(local_backup_path)}")
        return True
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return False

def cleanup_old_backups(days_to_keep=7):
    """Remove local backups older than specified days."""
    backup_dir = "backups"
    if not os.path.exists(backup_dir):
        return
    
    current_time = datetime.now()
    for filename in os.listdir(backup_dir):
        if filename.startswith("gatewise_backup_") and filename.endswith(".sql"):
            file_path = os.path.join(backup_dir, filename)
            file_time = datetime.fromtimestamp(os.path.getctime(file_path))
            age_days = (current_time - file_time).days
            
            if age_days > days_to_keep:
                try:
                    os.remove(file_path)
                    print(f"Removed old backup: {filename}")
                except OSError as e:
                    print(f"Error removing old backup {filename}: {e}")

def main():
    """Main backup function."""
    print("Starting database backup...")
    
    # Create backup filename
    backup_filename = create_backup_filename()
    
    # Create local backup
    local_backup_path = backup_to_local(backup_filename)
    if not local_backup_path:
        print("Failed to create local backup. Exiting.")
        return
    
    # Upload to S3 if configured
    if all([settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, settings.AWS_BUCKET_NAME]):
        backup_to_s3(local_backup_path)
    
    # Cleanup old backups
    cleanup_old_backups()
    
    print("Backup process completed.")

if __name__ == "__main__":
    main() 