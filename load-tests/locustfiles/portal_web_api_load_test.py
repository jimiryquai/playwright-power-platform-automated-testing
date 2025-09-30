# load-tests/locustfiles/portal_web_api_load_test.py
"""
Portal Web API Load Test - Complete Form Submission Flow with API PATCH

Tests the complete flow:
1. Submit organization form (ASP.NET Web Form)
2. Extract AppID from redirect
3. Get anti-forgery token from /_layout/tokenhtml
4. PATCH application via Web API

This test is designed to find the breaking point for concurrent Web API operations.
"""

from locust import HttpUser, task, between, events
import os
import sys
import random
import re
from datetime import datetime
from pathlib import Path
import urllib3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Disable SSL globally for corporate networks
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Add parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from helpers.playwright_auth import PlaywrightAuthReuser


class PortalWebAPIUser(HttpUser):
    """
    Simulates users submitting forms and using Web API
    Focus: Testing concurrent Web API PATCH operations
    """
    
    wait_time = between(2, 5)
    host = os.getenv('PORTAL_URL', 'https://ftrs-test.powerappsportals.com')
    
    def __init__(self, environment):
        super().__init__(environment)
        # Force SSL off for this user's client
        self.client.verify = False
    
    def on_start(self):
        """Load authentication when user starts"""
        self.user_id = f"api_user_{random.randint(1000, 9999)}"
        print(f"🚀 User {self.user_id} starting...")
        
        # Ensure SSL is off
        self.client.verify = False
        
        # Store tokens
        self.form_tokens = {}
        
        # Load Playwright authentication
        try:
            auth = PlaywrightAuthReuser('portal')
            cookies = auth.get_cookies()
            
            for name, value in cookies.items():
                self.client.cookies.set(name, value)
            
            print(f"✅ User {self.user_id}: Loaded {len(cookies)} auth cookies")
            
        except Exception as e:
            print(f"❌ Failed to load auth: {e}")
            print("   Run: npm run setup:portal")
    
    @task(1)
    def complete_submission_flow(self):
        """
        Complete flow: Submit form → Extract AppID → Get token → PATCH API
        This is the primary test - all other tasks removed to focus on API PATCH
        """
        
        form_url = "/New-Application-Organisation-Information/"
        
        # STEP 1: Load form page and extract ASP.NET tokens
        with self.client.get(
            form_url, 
            name="1. Load Form", 
            catch_response=True
        ) as response:
            
            if response.status_code != 200:
                response.failure(f"Failed to load form: {response.status_code}")
                return
            
            # Extract ASP.NET ViewState tokens
            if not self.extract_asp_net_tokens(response.text):
                response.failure("Failed to extract form tokens")
                return
            
            response.success()
        
        # STEP 2: Submit organization form
        org_data = {
            "name": f"Test Organization {random.randint(1000, 9999)}",
            "address1": f"{random.randint(1, 999)} Test Street",
            "town": random.choice(["London", "Manchester", "Birmingham", "Leeds"]),
            "postcode": f"TE{random.randint(1, 9)} {random.randint(1, 9)}AA",
            "country": "England",
            "relationship": random.choice(["121480000", "121480001", "121480002"])
        }
        
        prefix = "ctl00$ContentContainer$EntityFormControl_a73917b1e942f011877a6045bd0daffa$EntityFormControl_a73917b1e942f011877a6045bd0daffa_EntityFormView"
        
        form_data = {
            "__EVENTTARGET": "ctl00$ContentContainer$EntityFormControl_a73917b1e942f011877a6045bd0daffa$InsertButton",
            "__EVENTARGUMENT": "",
            "__VIEWSTATE": self.form_tokens.get("__VIEWSTATE", ""),
            "__VIEWSTATEGENERATOR": self.form_tokens.get("__VIEWSTATEGENERATOR", ""),
            "__EVENTVALIDATION": self.form_tokens.get("__EVENTVALIDATION", ""),
            f"{prefix}$cg_organisationname": org_data["name"],
            f"{prefix}$cg_addressline1": org_data["address1"],
            f"{prefix}$cg_town": org_data["town"],
            f"{prefix}$cg_postcode": org_data["postcode"],
            f"{prefix}$cg_country": org_data["country"],
            f"{prefix}$cg_firstreporgrelationship": org_data["relationship"],
        }
        
        with self.client.post(
            form_url,
            data=form_data,
            name="2. Submit Form",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": f"{self.host}{form_url}",
                "Origin": self.host,
            },
            catch_response=True,
            allow_redirects=False
        ) as response:
            
            if response.status_code != 302:
                response.failure(f"Expected 302 redirect, got {response.status_code}")
                return
            
            # Extract AppID from redirect location
            location = response.headers.get("Location", "")
            app_id_match = re.search(r'AppID=([a-f0-9-]+)', location, re.IGNORECASE)
            
            if not app_id_match:
                response.failure("No AppID in redirect location")
                print(f"   Location was: {location}")
                return
            
            app_id = app_id_match.group(1)
            response.success()
            print(f"   AppID extracted: {app_id[:8]}...")
        
        # STEP 3: Get anti-forgery token for API call
        timestamp = int(datetime.now().timestamp() * 1000)
        
        with self.client.get(
            f"/_layout/tokenhtml?_={timestamp}",
            name="3. Get API Token",
            catch_response=True
        ) as token_response:
            
            if token_response.status_code != 200:
                token_response.failure(f"Token request failed: {token_response.status_code}")
                return
            
            # Extract __RequestVerificationToken from HTML
            token_match = re.search(
                r'name="__RequestVerificationToken"[^>]+value="([^"]+)"',
                token_response.text
            )
            
            if not token_match:
                token_response.failure("No RequestVerificationToken found in response")
                return
            
            api_token = token_match.group(1)
            token_response.success()
            print(f"   API token obtained: {api_token[:20]}...")
        
        # STEP 4: PATCH application via Web API (THE KEY TEST)
        # Randomly choose Yes (121480000) or No (121480001)
        measures_choice = random.choice([121480000, 121480001])
        
        with self.client.patch(
            f"/_api/cg_applications({app_id})",
            json={"cg_measures_already_applied": measures_choice},
            headers={
                "__RequestVerificationToken": api_token,
                "Content-Type": "application/json",
            },
            name="4. PATCH Web API ⭐",
            catch_response=True
        ) as patch_response:
            
            if patch_response.status_code == 204:
                # Success - 204 No Content is expected for PATCH
                patch_response.success()
                print(f"✅ User {self.user_id}: Complete flow succeeded (PATCH OK)")
                
            elif patch_response.status_code == 401:
                patch_response.failure("PATCH unauthorized - auth/token issue")
                print(f"❌ User {self.user_id}: PATCH auth failed")
                
            elif patch_response.status_code == 429:
                patch_response.failure("PATCH rate limited - too many requests")
                print(f"⚠️  User {self.user_id}: Hit rate limit")
                
            elif patch_response.status_code == 400:
                patch_response.failure("PATCH bad request - invalid data")
                print(f"❌ User {self.user_id}: PATCH validation failed")
                
            elif patch_response.status_code >= 500:
                patch_response.failure(f"PATCH server error: {patch_response.status_code}")
                print(f"💥 User {self.user_id}: Server error on PATCH")
                
            else:
                patch_response.failure(f"PATCH unexpected status: {patch_response.status_code}")
                print(f"❓ User {self.user_id}: Unexpected PATCH response")
    
    def extract_asp_net_tokens(self, html_content):
        """Extract ASP.NET hidden fields from form HTML"""
        
        patterns = {
            '__VIEWSTATE': r'(?:id|name)="__VIEWSTATE"[^>]*value="([^"]*)"',
            '__VIEWSTATEGENERATOR': r'(?:id|name)="__VIEWSTATEGENERATOR"[^>]*value="([^"]*)"',
            '__EVENTVALIDATION': r'(?:id|name)="__EVENTVALIDATION"[^>]*value="([^"]*)"',
        }
        
        extracted_count = 0
        
        for field_name, pattern in patterns.items():
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                value = match.group(1)
                self.form_tokens[field_name] = value
                extracted_count += 1
        
        return extracted_count >= 2  # Need at least VIEWSTATE and EVENTVALIDATION


# Event listeners for reporting
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(f"""
    🌐 Portal Web API Load Test
    ====================================
    Target: {os.getenv('PORTAL_URL')}
    Focus: Testing concurrent Web API PATCH operations
    Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    
    Flow:
    1. Submit org form (ASP.NET)
    2. Extract AppID from redirect
    3. Get API token
    4. PATCH via Web API ⭐
    ====================================
    """)

@events.test_stop.add_listener  
def on_test_stop(environment, **kwargs):
    """Print summary focusing on Web API performance"""
    
    # Get stats for the PATCH operation specifically
    patch_stats = None
    for stat in environment.stats.entries.values():
        if "PATCH Web API" in stat.name:
            patch_stats = stat
            break
    
    print(f"""
    ✅ Web API Load Test Complete
    ====================================
    Total Requests: {environment.stats.total.num_requests}
    Failed Requests: {environment.stats.total.num_failures}
    Success Rate: {100 * (1 - environment.stats.total.fail_ratio):.1f}%
    
    Avg Response Time: {environment.stats.total.avg_response_time:.0f}ms
    Max Response Time: {environment.stats.total.max_response_time:.0f}ms
    """)
    
    if patch_stats:
        print(f"""
    ⭐ Web API PATCH Performance:
    ------------------------------------
    PATCH Requests: {patch_stats.num_requests}
    PATCH Failures: {patch_stats.num_failures}
    PATCH Success Rate: {100 * (1 - patch_stats.fail_ratio):.1f}%
    
    PATCH Avg Response: {patch_stats.avg_response_time:.0f}ms
    PATCH Min Response: {patch_stats.min_response_time:.0f}ms
    PATCH Max Response: {patch_stats.max_response_time:.0f}ms
    ====================================
    """)
    
    # Determine if system handled the load well
    if patch_stats and patch_stats.fail_ratio == 0:
        print("    ✅ System handled all Web API requests successfully")
    elif patch_stats and patch_stats.fail_ratio < 0.05:
        print(f"    ⚠️  {patch_stats.fail_ratio*100:.1f}% failure rate - acceptable")
    elif patch_stats and patch_stats.fail_ratio < 0.20:
        print(f"    ⚠️  {patch_stats.fail_ratio*100:.1f}% failure rate - approaching limits")
    else:
        print(f"    ❌ {patch_stats.fail_ratio*100:.1f}% failure rate - BREAKING POINT REACHED")

if __name__ == "__main__":
    print("Run with: locust -f portal_web_api_load_test.py")