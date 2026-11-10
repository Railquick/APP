import os
import sys
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
PHONEPE_MERCHANT_ID: str = os.getenv("PHONEPE_MERCHANT_ID", "PGTESTPAYUAT").strip()
PHONEPE_SALT_KEY: str = os.getenv(
    "PHONEPE_SALT_KEY", "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
).strip()
PHONEPE_SALT_INDEX: str = os.getenv("PHONEPE_SALT_INDEX", "1").strip()
PHONEPE_ENV: str = os.getenv("PHONEPE_ENV", "PROD").strip().upper()

# Standard PhonePe Base URLs
# Candidate list for Production Standard Checkout:
# - Primary: https://api.phonepe.com/apis/pg
# - Alternate 1: https://api.phonepe.com
# - Alternate 2: https://api.phonepe.com/apis/hermes
PHONEPE_PROD_PRIMARY_URL: str = "https://api.phonepe.com/apis/pg"
PHONEPE_PROD_ALT1_URL: str = "https://api.phonepe.com"
PHONEPE_PROD_HERMES_URL: str = "https://api.phonepe.com/apis/hermes"

PHONEPE_PROD_BASE_URLS: list[str] = [
    PHONEPE_PROD_PRIMARY_URL,
    PHONEPE_PROD_ALT1_URL,
    PHONEPE_PROD_HERMES_URL,
]

PHONEPE_PROD_BASE_URL: str = PHONEPE_PROD_PRIMARY_URL
PHONEPE_UAT_BASE_URL: str = "https://api-preprod.phonepe.com/apis/pg-sandbox"
PHONEPE_ALT_SANDBOX_BASE_URL: str = "https://api.phonepe.com/apis/pg-sandbox"

# In PROD, default to https://api.phonepe.com/apis/pg unless explicitly overridden in env
if PHONEPE_ENV == "PROD":
    PHONEPE_BASE_URL: str = os.getenv(
        "PHONEPE_BASE_URL", PHONEPE_PROD_BASE_URL
    ).strip().rstrip("/")
else:
    PHONEPE_BASE_URL: str = os.getenv(
        "PHONEPE_BASE_URL", PHONEPE_UAT_BASE_URL
    ).strip().rstrip("/")

PHONEPE_CALLBACK_URL: str = os.getenv(
    "PHONEPE_CALLBACK_URL",
    "https://railquick-backend.onrender.com/api/v1/payments/phonepe-callback",
).strip()

# Module-level settings alias
settings = sys.modules[__name__]
