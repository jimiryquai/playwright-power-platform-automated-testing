"""
Portal load test that reuses Playwright B2C authentication
"""

from locust import HttpUser, task, between, events
import os
import sys
import random
from datetime import datetime
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from helpers.playwright_auth import PlaywrightAuthReuser

class PortalAuthenticatedUser(HttpUser):
    """Portal user with B2C authentication from Playwright"""
    
    wait_time = between(2, 5)
    host = os.getenv('PORTAL_URL', 'https://portal.powerappsportals.com')
    
    def on_start(self):
        """Load B2C authentication from Playwright"""
        self.user_id = f"portal_user_{random.randint(1000, 9999)}"
        
        try:
            auth = PlaywrightAuthReuser('portal')
            cookies = auth.get_cookies()
            for name, value in cookies.items():
                self.client.cookies.set(name, value)
            print(f"✅ User {self.user_id}: Loaded {len(cookies)} auth cookies")
        except Exception as e:
            print(f"❌ Failed to load auth: {e}")
            print("   Run: npm run setup:portal")
    
    @task(5)
    def browse_homepage(self):
        """Browse the portal homepage"""
        self.client.get("/", name="Homepage")
    
    @task(3)
    def browse_pages(self):
        """Browse various portal pages"""
        pages = ["/about", "/contact", "/services", "/support"]
        page = random.choice(pages)
        self.client.get(page, name=f"Portal Page")
    
    @task(2)
    def search_portal(self):
        """Use portal search"""
        terms = ["help", "contact", "service"]
        term = random.choice(terms)
        self.client.get(f"/search?q={term}", name="Portal Search")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(f"""
    🌐 Portal Load Test Starting (Using B2C Auth)
    Target: {os.getenv('PORTAL_URL')}
    Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """)

if __name__ == "__main__":
    print("Run with: locust -f portal_with_auth.py")
