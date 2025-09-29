# load-tests/locustfiles/mda_web_only.py
"""
MDA load test using ONLY web UI endpoints (no API calls)
This works with cookie authentication from Playwright
"""

from locust import HttpUser, task, between, events
import os
import sys
import random
from datetime import datetime
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from helpers.playwright_auth import PlaywrightAuthReuser

class MDAWebOnlyUser(HttpUser):
    """Test MDA using only web UI endpoints that work with cookies"""
    
    wait_time = between(2, 5)  # Users browse, not rapid-fire API calls
    host = os.getenv('APP_URL', 'https://org.crm.dynamics.com')
    
    def on_start(self):
        """Load cookie auth from Playwright"""
        self.user_id = f"user_{random.randint(1000, 9999)}"
        
        try:
            auth = PlaywrightAuthReuser('mda')
            cookies = auth.get_cookies()
            
            # Apply cookies to session
            for name, value in cookies.items():
                self.client.cookies.set(name, value)
            
            print(f"✅ User {self.user_id}: Loaded {len(cookies)} cookies")
            
            # Store common entity types for random selection
            self.entities = ['account', 'contact', 'lead']
            
        except Exception as e:
            print(f"❌ Failed to load auth: {e}")
            print("   Run: npm run setup:mda")
    
    @task(10)
    def dashboard(self):
        """Load main dashboard - most common action"""
        with self.client.get(
            "/main.aspx",
            name="Dashboard",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                # Check if we're actually logged in (not redirected to login)
                if "Microsoft Dynamics 365" in response.text or "sitemap" in response.text:
                    response.success()
                else:
                    response.failure("Got login page - not authenticated")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(8)
    def list_accounts(self):
        """Browse accounts list view"""
        with self.client.get(
            "/main.aspx?pagetype=entitylist&etn=account",
            name="Accounts List",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(6)
    def list_contacts(self):
        """Browse contacts list view"""
        with self.client.get(
            "/main.aspx?pagetype=entitylist&etn=contact",
            name="Contacts List",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    

    
    @task(5)
    def global_search(self):
        """Use the global search feature"""
        search_terms = ["test", "demo", "account", "contact", "john", "smith", "2024"]
        term = random.choice(search_terms)
        
        with self.client.get(
            f"/main.aspx?pagetype=search&searchText={term}",
            name="Global Search",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(3)
    def open_create_form(self):
        """Open a create new record form"""
        entity = random.choice(self.entities)
        
        with self.client.get(
            f"/main.aspx?pagetype=entityrecord&etn={entity}&id=",
            name=f"Create {entity.title()} Form",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(2)
    def advanced_find(self):
        """Open Advanced Find page"""
        with self.client.get(
            "/main.aspx?pagetype=advancedfind",
            name="Advanced Find",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(4)
    def view_recent_items(self):
        """View recently accessed items"""
        with self.client.get(
            "/main.aspx?pagetype=recentlyviewed",
            name="Recent Items",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(2)
    def activities_view(self):
        """View activities/timeline"""
        with self.client.get(
            "/main.aspx?pagetype=entitylist&etn=activitypointer",
            name="Activities List",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status {response.status_code}")

# Event handlers for reporting
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(f"""
    🌐 MDA Web UI Load Test Starting (No API Calls)
    ===============================================
    Testing ONLY web interface endpoints
    Target: {os.getenv('APP_URL')}
    Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    ===============================================
    """)

@events.test_stop.add_listener  
def on_test_stop(environment, **kwargs):
    print(f"""
    ✅ Load Test Complete
    =====================
    Total Requests: {environment.stats.total.num_requests}
    Failures: {environment.stats.total.num_failures}
    Avg Response Time: {environment.stats.total.avg_response_time:.2f}ms
    =====================
    """)

if __name__ == "__main__":
    print("Run with: locust -f mda_web_only.py")