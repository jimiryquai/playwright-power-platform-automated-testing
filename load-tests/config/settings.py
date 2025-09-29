import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # URLs
    MDA_URL = os.getenv('APP_URL', 'https://org.crm.dynamics.com')
    PORTAL_URL = os.getenv('PORTAL_URL', 'https://portal.powerappsportals.com')
    PUBLIC_FILE_URL = os.getenv('AZURE_APP_URL', '')
    
    # Auth
    USERNAME = os.getenv('O365_USERNAME', '')
    PASSWORD = os.getenv('O365_PASSWORD', '')
    B2C_USERNAME = os.getenv('B2C_USERNAME', '')
    B2C_PASSWORD = os.getenv('B2C_PASSWORD', '')
    
    # Load test settings
    MIN_WAIT = 1000  # milliseconds
    MAX_WAIT = 3000  # milliseconds

config = Config()
