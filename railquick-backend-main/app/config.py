import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://luyaddknzpiyrhztlage.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eWFkZGtuenBpeXJoenRsYWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc4MTc0MywiZXhwIjoyMTA2MzU3NzQzfQ.WNB9rsqlberSojtox8d9SGNkeZMMHVlkplLAjXA61EE",
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

RAILWAY_API_BASE_URL: str = os.getenv(
    "RAILWAY_API_BASE_URL", "https://irctc1.p.rapidapi.com/api/v1"
)
RAILWAY_API_KEY: str = os.getenv("RAILWAY_API_KEY", "")
RAILWAY_API_HOST: str = os.getenv("RAILWAY_API_HOST", "irctc1.p.rapidapi.com")

# PhonePe Standard Checkout Configuration
PHONEPE_MERCHANT_ID: str = os.getenv("PHONEPE_MERCHANT_ID", "PGTESTPAYUAT")
PHONEPE_SALT_KEY: str = os.getenv(
    "PHONEPE_SALT_KEY", "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
)
PHONEPE_SALT_INDEX: str = os.getenv("PHONEPE_SALT_INDEX", "1")
PHONEPE_ENV: str = os.getenv("PHONEPE_ENV", "PROD").upper()

if PHONEPE_ENV == "PROD":
    PHONEPE_BASE_URL: str = os.getenv(
        "PHONEPE_BASE_URL", "https://api.phonepe.com/apis/hermes"
    )
else:
    PHONEPE_BASE_URL: str = os.getenv(
        "PHONEPE_BASE_URL", "https://api-preprod.phonepe.com/apis/pg-sandbox"
    )

PHONEPE_CALLBACK_URL: str = os.getenv(
    "PHONEPE_CALLBACK_URL",
    "https://railquick-backend.onrender.com/api/v1/payments/phonepe-callback",
)
