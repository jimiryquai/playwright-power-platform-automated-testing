# load-tests/ftrs_portal_optimized.py
"""
FTRS Portal Organization Form Load Test
Optimized for maximum submission throughput
"""

from locust import HttpUser, task, between, events, FastHttpUser, constant_pacing
import os
import random
import re
import json
import uuid
from datetime import datetime
from pathlib import Path
from faker import Faker
from urllib.parse import parse_qs, urlparse
import threading

# Load environment from project root .env
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

fake = Faker(['en_GB'])

# Global counters
submission_counter = {"count": 0, "lock": threading.Lock()}
successful_appids = {"ids": [], "lock": threading.Lock()}
failed_counter = {"count": 0, "lock": threading.Lock()}

# Pre-generate test data
PRE_GENERATED_ORGS = []
PRE_GENERATED_COUNT = 1000

def pre_generate_org_data():
    """Pre-generate organization data for FTRS portal"""
    global PRE_GENERATED_ORGS
    print(f"⚡ Pre-generating {PRE_GENERATED_COUNT} organization datasets...")
    
    for _ in range(PRE_GENERATED_COUNT):
        org_number = random.randint(10000, 99999)
        
        org_data = {
            'cg_organisationname': f"{fake.company()} Ltd {org_number}",
            'cg_addressline1': fake.street_address(),
            'cg_addressline2': '',
            'cg_citytown': fake.city(),
            'cg_county': random.choice(['Greater London', 'West Midlands', 'Greater Manchester']),
            'cg_postalcode': fake.postcode(),
            'cg_country': 'United Kingdom',
            'cg_firstreporgrelationship': str(random.randint(0, 2)),
            'cg_organisationtype': random.choice(['Limited Company', 'PLC', 'Partnership']),
            'cg_contactname': fake.name(),
            'cg_contactemail': fake.company_email(),
            'cg_contactphone': fake.phone_number(),
            'cg_registrationnumber': f"GB{random.randint(10000000, 99999999)}",
            'cg_vatnumber': f"GB{random.randint(100000000, 999999999)}",
            'submit': 'Submit',
            '__RequestVerificationToken': '',
        }
        
        PRE_GENERATED_ORGS.append(org_data)
    
    print(f"✅ Pre-generation complete!")

# Pre-generate on startup
pre_generate_org_data()


class FTRSPortalUser(FastHttpUser):
    """
    FTRS Portal user for maximum form submission throughput
    """
    
    wait_time = constant_pacing(0.3)  # Aggressive pacing
    host = os.getenv('PORTAL_URL', 'https://ftrs-test.powerappsportals.com')
    
    # Connection settings
    network_timeout = 30.0
    connection_timeout = 30.0
    
    def on_start(self):
        """Initialize user session"""
        self.user_id = f"ftrs_user_{random.randint(1000, 9999)}"
        self.submission_count = 0
        self.csrf_token = None
        self.org_data_index = random.randint(0, PRE_GENERATED_COUNT - 1)
        
        # Try to get initial CSRF token
        self.initialize_session()
        
        print(f"🚀 User {self.user_id} ready")
    
    def initialize_session(self):
        """Get initial CSRF token from form page"""
        try:
            with self.client.get(
                "/New-Application-Organisation-Information/",
                catch_response=True,
                headers={'Accept': 'text/html,application/xhtml+xml'},
                timeout=10
            ) as response:
                if response.status_code == 200:
                    self.extract_csrf_token(response.text)
                    response.success()
        except Exception as e:
            print(f"Session init error: {e}")
    
    def extract_csrf_token(self, html_content):
        """Extract CSRF token from HTML"""
        if html_content:
            patterns = [
                r'<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]+)"',
                r'__RequestVerificationToken["\']:\s*["\']([^"\']+)["\']',
            ]
            
            for pattern in patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    self.csrf_token = match.group(1)
                    break
    
    def get_next_org_data(self):
        """Get pre-generated org data"""
        data = PRE_GENERATED_ORGS[self.org_data_index].copy()
        self.org_data_index = (self.org_data_index + 1) % PRE_GENERATED_COUNT
        
        # Add CSRF token
        if self.csrf_token:
            data['__RequestVerificationToken'] = self.csrf_token
        
        # Make org name unique
        data['cg_organisationname'] = f"{data['cg_organisationname']} {datetime.now().strftime('%H%M%S%f')[:8]}"
        
        return data
    
    @task(3)
    def direct_form_submission(self):
        """Direct submission to form endpoint"""
        org_data = self.get_next_org_data()
        
        with self.client.post(
            "/New-Application-Organisation-Information/",
            data=org_data,
            catch_response=True,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cache-Control': 'max-age=0',
                'Origin': self.host,
                'Referer': f'{self.host}/New-Application-Organisation-Information/',
            },
            timeout=15,
            allow_redirects=False,
            name="Submit Org Form"
        ) as response:
            
            # Check for success (302 redirect with AppID)
            if response.status_code == 302:
                location = response.headers.get('location', '')
                
                if 'AppID=' in location:
                    app_id_match = re.search(r'AppID=([a-f0-9-]+)', location, re.IGNORECASE)
                    if app_id_match:
                        app_id = app_id_match.group(1)
                        self.register_success(app_id)
                        response.success()
                        return
                
                response.failure("Redirect without AppID")
                self.register_failure()
                
            elif response.status_code == 200:
                response_text = response.text if response.text else ""
                
                if 'successfully' in response_text.lower() or 'thank you' in response_text.lower():
                    self.register_success()
                    response.success()
                elif 'error' in response_text.lower() or 'required' in response_text.lower():
                    self.extract_csrf_token(response_text)
                    response.failure("Validation error")
                    self.register_failure()
                else:
                    response.failure("Unknown response")
                    self.register_failure()
            else:
                response.failure(f"Status: {response.status_code}")
                self.register_failure()
    
    @task(1)
    def full_flow_submission(self):
        """Full flow with navigation"""
        # Load form page first
        with self.client.get(
            "/New-Application-Organisation-Information/",
            catch_response=True,
            timeout=10,
            name="Load Form"
        ) as response:
            if response.status_code == 200:
                self.extract_csrf_token(response.text)
                response.success()
            else:
                response.failure(f"Failed to load form: {response.status_code}")
                return
        
        # Submit form
        org_data = self.get_next_org_data()
        
        with self.client.post(
            "/New-Application-Organisation-Information/",
            data=org_data,
            catch_response=True,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': f'{self.host}/New-Application-Organisation-Information/'
            },
            timeout=15,
            allow_redirects=False,
            name="Submit After Load"
        ) as response:
            if response.status_code == 302:
                location = response.headers.get('location', '')
                if 'AppID=' in location:
                    app_id_match = re.search(r'AppID=([a-f0-9-]+)', location, re.IGNORECASE)
                    if app_id_match:
                        self.register_success(app_id_match.group(1))
                        response.success()
                        return
                
            response.failure(f"Submission failed: {response.status_code}")
            self.register_failure()
    
    def register_success(self, app_id=None):
        """Track successful submission"""
        with submission_counter["lock"]:
            submission_counter["count"] += 1
            self.submission_count += 1
            
            if app_id:
                with successful_appids["lock"]:
                    successful_appids["ids"].append(app_id)
                    if len(successful_appids["ids"]) % 50 == 0:
                        print(f"🎯 Milestone: {len(successful_appids['ids'])} AppIDs generated!")
            
            if submission_counter["count"] % 25 == 0:
                print(f"📊 Progress: {submission_counter['count']} submissions")
    
    def register_failure(self):
        """Track failed submission"""
        with failed_counter["lock"]:
            failed_counter["count"] += 1
    
    def on_stop(self):
        """Cleanup"""
        if self.submission_count > 0:
            print(f"✓ User {self.user_id}: {self.submission_count} submissions")


# Event Handlers
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Test start"""
    print(f"""
    ⚡ FTRS Portal Load Test Starting
    ==================================
    Target: {os.getenv('PORTAL_URL')}
    Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    ==================================
    """)
    
    submission_counter["count"] = 0
    failed_counter["count"] = 0
    successful_appids["ids"] = []

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Test complete"""
    total_time = (datetime.now() - environment.stats.start_time).total_seconds() if hasattr(environment.stats, 'start_time') else 0
    
    print(f"""
    ✅ Test Complete
    ================
    Total Submissions: {submission_counter['count']}
    Successful AppIDs: {len(successful_appids['ids'])}
    Failed Attempts: {failed_counter['count']}
    
    Test Duration: {total_time:.1f} seconds
    Submissions/Second: {submission_counter['count'] / total_time if total_time > 0 else 0:.2f}
    ================
    """)
    
    # Save AppIDs
    if successful_appids["ids"]:
        filename = f"ftrs_appids_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w') as f:
            for app_id in successful_appids["ids"]:
                f.write(f"{app_id}\n")
        print(f"📝 Saved {len(successful_appids['ids'])} AppIDs to {filename}")


if __name__ == "__main__":
    print("""
    Run with:
    python -m locust -f ftrs_portal_optimized.py --users 100 --spawn-rate 25 --run-time 5m
    """)