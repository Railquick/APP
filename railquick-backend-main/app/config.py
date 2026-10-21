import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://luyaddknzpiyrhztlage.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eWFkZGtuenBpeXJoenRsYWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc4MTc0MywiZXhwIjoyMTA2MzU3NzQzfQ.WNB9rsqlberSojtox8d9SGNkeZMMHVlkplLAjXA61EE")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) 
