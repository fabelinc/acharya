import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_reset_email(to_email: str, reset_link: str):
    msg = EmailMessage()
    msg['Subject'] = 'Aacharya Password Reset'
    msg['From'] = EMAIL_USER
    msg['To'] = to_email
    msg.set_content(f'Click the link below to reset your password:\n\n{reset_link}\n\nThis link will expire in 30 minutes.')

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
            print(f"[INFO] Reset email sent to {to_email}")
    except Exception as e:
        print(f"[ERROR] Email failed: {e}")
        raise
