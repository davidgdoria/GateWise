import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_email_gmail(to_email: str, subject: str, body: str):
    # Get credentials from environment variables
    gmail_user = os.environ.get("GMAIL_USER")
    gmail_password = os.environ.get("GMAIL_PASSWORD")
    if not gmail_user or not gmail_password:
        raise RuntimeError("GMAIL_USER and GMAIL_PASSWORD must be set in environment variables.")

    msg = MIMEMultipart()
    msg["From"] = gmail_user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(gmail_user, gmail_password)
            server.sendmail(gmail_user, to_email, msg.as_string())
    except Exception as e:
        raise RuntimeError(f"Failed to send email: {e}")
