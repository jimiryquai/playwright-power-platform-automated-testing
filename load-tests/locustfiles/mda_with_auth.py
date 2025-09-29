# load-tests/locustfiles/mda_with_auth.py
"""
MDA/D365 load test that reuses Playwright authentication.
"""

from locust import HttpUser, task, between, events
import os
import sys
import json
import random
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# IMPORTANT: Load .env file
from dotenv import load_dotenv
load_dotenv()  # This loads your .env file

from helpers.playwright_auth import PlaywrightAuthReuser

class MDAAuthenticatedUser(HttpUser):
    """MDA user with authentication from Playwright tests"""
    
    wait_time = between(1, 3)
    
    # Now this will actually read from your .env file
    host = os.getenv('MDA_URL', 'https://org.crm.dynamics.com')
    
    def on_start(self):
        """Set up authentication from Playwright's saved state"""
        self.user_id = f"user_{random.randint(1000, 9999)}"
        print(f"🚀 User {self.user_id} starting...")
        print(f"📍 Target URL: {self.host}")  # Debug line to show actual URL
        
        try:
            auth = PlaywrightAuthReuser('mda')
            auth.apply_auth_to_locust_client(self.client)
            print(f"✅ User {self.user_id}: Authentication loaded from Playwright")
            self.verify_auth()
        except Exception as e:
            print(f"❌ Failed to load auth: {e}")
            print("   Make sure to run: npm run setup:mda")
    
    def verify_auth(self):
        """Verify that authentication is working"""
        with self.client.get(
            "/api/data/v9.2/WhoAmI",
            name="Verify Auth",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Authenticated as: {data.get('UserId', 'Unknown')}")
                response.success()
            else:
                print(f"⚠️  Auth verification failed with status {response.status_code}")
                response.failure(f"Auth check failed: {response.status_code}")
    
    @task(5)
    def list_accounts(self):
        """List accounts"""
        with self.client.get(
            "/api/data/v9.2/accounts?$top=20&$select=name,accountnumber",
            name="List Accounts",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
                data = response.json()
                self.account_ids = [acc['accountid'] for acc in data.get('value', [])]
            elif response.status_code == 401:
                response.failure("Not authenticated - run 'npm run setup:mda' first")
            else:
                response.failure(f"Failed: {response.status_code}")
    
    @task(2)
    def search_accounts(self):
        """Search accounts"""
        terms = ['Test', 'Demo', 'Sample']
        term = random.choice(terms)
        
        with self.client.get(
            f"/api/data/v9.2/accounts?$filter=contains(name,'{term}')",
            name="Search Accounts",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed: {response.status_code}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    # Reload to make sure we have the latest env
    load_dotenv()
    print(f"""
    🚀 MDA Load Test Starting (Using Playwright Auth)
    ================================================
    Target: {os.getenv('APP_URL', 'APP_URL not set!')}
    Auth: Reusing from auth/user.json
    Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    ================================================
    """)

if __name__ == "__main__":
    load_dotenv()
    print(f"APP_URL from .env: {os.getenv('APP_URL', 'Not found!')}")
    print("Run with: locust -f mda_with_auth.py")