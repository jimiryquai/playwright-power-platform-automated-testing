from locust import HttpUser, task, between
import os
import sys

# Add parent directory to path for imports (backup for when PYTHONPATH isn't set)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class QuickTestUser(HttpUser):
    """Simple test to verify Locust is working"""
    
    wait_time = between(1, 3)
    host = os.getenv('APP_URL', os.getenv('PORTAL_URL', 'https://www.example.com'))
    
    def on_start(self):
        """Log start"""
        print(f"🚀 Starting test against: {self.host}")
    
    @task
    def test_homepage(self):
        """Test the homepage"""
        with self.client.get("/", catch_response=True) as response:
            if response.status_code < 400:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")
    
    @task(2)  # This task runs twice as often
    def test_api(self):
        """Test an API endpoint"""
        # Adjust endpoint based on your app
        endpoint = "/api/data" if "dynamics" in self.host else "/api/status"
        
        with self.client.get(endpoint, catch_response=True) as response:
            # Accept 404 as valid (endpoint might not exist in example.com)
            if response.status_code < 500:
                response.success()
            else:
                response.failure(f"Server error: {response.status_code}")
