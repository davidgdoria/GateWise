# Create .env file with necessary environment variables
@"
POSTGRES_USER=gatewise
POSTGRES_PASSWORD=gatewise_password
POSTGRES_DB=gatewise_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CAMERA_DEVICE_ID=0
CAMERA_RESOLUTION_WIDTH=1280
CAMERA_RESOLUTION_HEIGHT=720
OCR_CONFIDENCE_THRESHOLD=80
DEBUG=True
"@ | Out-File -FilePath .env -Encoding utf8

Write-Host ".env file created successfully!" 