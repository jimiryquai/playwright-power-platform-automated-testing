# load-tests/locustfiles/public_file_with_auth.py
"""
Public File load test that reuses Playwright authentication
"""

from locust import HttpUser, task, between, events
import os
import sys
import random
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from helpers.playwright_auth import PlaywrightAuthReuser

class PublicFileAuthenticatedUser(HttpUser):
    """Public File user with Azure AD authentication from Playwright"""
    
    wait_time = between(1, 3)
    host = os.getenv('AZURE_APP_URL', os.getenv('PUBLIC_FILE_URL', 'https://app.azurewebsites.net'))
    
    def on_start(self):
        """Load Azure AD authentication from Playwright"""
        self.user_id = f"public_user_{random.randint(1000, 9999)}"
        print(f"🚀 User {self.user_id} starting...")
        
        try:
            auth = PlaywrightAuthReuser('public-file')
            
            # Apply cookies to Locust client
            cookies = auth.get_cookies()
            for name, value in cookies.items():
                self.client.cookies.set(name, value)
            
            # Check for auth header (though Public File might use cookies only)
            auth_header = auth.get_auth_header()
            if auth_header:
                self.client.headers['Authorization'] = auth_header
                print(f"✅ User {self.user_id}: Loaded auth token")
            
            print(f"✅ User {self.user_id}: Loaded {len(cookies)} auth cookies")
            
        except Exception as e:
            print(f"❌ Failed to load auth: {e}")
            print("   Run: npm run setup:public-file")
    
    @task(5)
    def browse_main_page(self):
        """Browse the main public file page"""
        with self.client.get("/", name="Main Page", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")
    
    @task(3)
    def list_files(self):
        """List available files"""
        # Adjust this endpoint based on your actual Public File app
        with self.client.get(
            "/api/files",
            name="List Files",
            catch_response=True
        ) as response:
            if response.status_code in [200, 404]:  # 404 OK if endpoint differs
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")
    
    @task(2)
    def search_files(self):
        """Search for files"""
        search_terms = ["document", "report", "file", "public", "test"]
        term = random.choice(search_terms)
        
        with self.client.get(
            f"/search?q={term}",
            name="Search Files",
            catch_response=True
        ) as response:
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")
    
    @task(1)
    def download_file(self):
        """Simulate file download"""
        # You would replace this with actual file IDs from your app
        file_ids = ["file1", "file2", "file3", "test-doc", "sample-report"]
        file_id = random.choice(file_ids)
        
        with self.client.get(
            f"/download/{file_id}",
            name="Download File",
            catch_response=True,
            stream=True  # Important for file downloads
        ) as response:
            if response.status_code in [200, 404]:
                response.success()
                if response.status_code == 200:
                    # Don't actually download, just count the size
                    size = len(response.content) if response.content else 0
                    print(f"📄 User {self.user_id}: Downloaded {file_id} ({size} bytes)")
            else:
                response.failure(f"Download failed: {response.status_code}")
    
    @task(2)
    def view_file_details(self):
        """View file details/metadata"""
        file_ids = ["file1", "file2", "file3"]
        file_id = random.choice(file_ids)
        
        with self.client.get(
            f"/files/{file_id}",
            name="View File Details",
            catch_response=True
        ) as response:
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")
    
    def on_stop(self):
        """Cleanup when user stops"""
        print(f"👋 User {self.user_id} finished testing")

# Test events for better reporting
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(f"""
    📁 Public File Load Test Starting (Using Azure AD Auth)
    ======================================================
    Target: {os.getenv('AZURE_APP_URL', os.getenv('PUBLIC_FILE_URL', 'Not configured'))}
    Auth: Reusing from auth/public-file.json
    Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    ======================================================
    """)

@events.test_stop.add_listener  
def on_test_stop(environment, **kwargs):
    print(f"""
    ✅ Public File Load Test Complete
    =================================
    Total Requests: {environment.stats.total.num_requests}
    Failures: {environment.stats.total.num_failures}
    Avg Response Time: {environment.stats.total.avg_response_time:.2f}ms
    =================================
    """)

if __name__ == "__main__":
    print(f"Public File Load Test ready for: {os.getenv('AZURE_APP_URL', 'Not configured')}")
    print("Run with: locust -f public_file_with_auth.py")