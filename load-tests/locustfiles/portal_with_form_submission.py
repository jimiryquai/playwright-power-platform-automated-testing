# load-tests/locustfiles/portal_with_form_submission.py
"""
Power Pages Portal Load Test with Form Submission - Starter Version
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

# Load environment variables from .env file
load_dotenv()

# SIMPLEST FIX: Disable SSL globally
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["REQUESTS_CA_BUNDLE"] = ""

# Disable SSL warnings for corporate environments
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Add parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from helpers.playwright_auth import PlaywrightAuthReuser


class PortalUserWithFormSubmission(HttpUser):
    """Portal user that can authenticate and submit forms"""

    wait_time = between(2, 5)
    host = os.getenv("PORTAL_URL", "https://ftrs-test.powerappsportals.com")

    def __init__(self, environment):
        super().__init__(environment)
        # Force SSL off for THIS user's client
        self.client.verify = False

    def on_start(self):
        """Load authentication when user starts"""
        self.user_id = f"portal_user_{random.randint(1000, 9999)}"
        print(f"🚀 User {self.user_id} starting...")

        # Store form tokens
        self.form_tokens = {}

        # Load Playwright authentication
        try:
            auth = PlaywrightAuthReuser("portal")
            cookies = auth.get_cookies()

            for name, value in cookies.items():
                self.client.cookies.set(name, value)

            print(f"✅ User {self.user_id}: Loaded {len(cookies)} auth cookies")

        except Exception as e:
            print(f"❌ Failed to load auth: {e}")
            print("   Run: npm run setup:portal")

    @task(5)
    def verify_authentication(self):
        """Test 1: Verify we can access the portal homepage"""
        with self.client.get(
            "/", name="Homepage - Auth Check", catch_response=True
        ) as response:

            if response.status_code == 200:
                response.success()
                print(f"✅ User {self.user_id}: Homepage accessed")
            else:
                response.failure(f"Failed: {response.status_code}")

    @task(3)
    def load_form_page(self):
        """Test 2: Load the form page and extract hidden fields"""
        form_url = "/New-Application-Organisation-Information/"

        with self.client.get(
            form_url, name="Load Form Page", catch_response=True
        ) as response:

            if response.status_code == 200:
                response.success()

                # Extract ASP.NET tokens
                self.extract_tokens(response.text)

                print(
                    f"📋 User {self.user_id}: Form loaded, extracted {len(self.form_tokens)} tokens"
                )
            else:
                response.failure(f"Failed: {response.status_code}")

    @task(1)
    def submit_form(self):
        """Test 3: Submit the organization form"""

        form_url = "/New-Application-Organisation-Information/"

        # Step 1: Load form to get fresh tokens
        print(f"📋 User {self.user_id}: Loading form for submission...")

        with self.client.get(
            form_url, name="Load Form (for submit)", catch_response=True
        ) as response:
            if response.status_code != 200:
                print(f"❌ Failed to load form")
                return

            self.extract_tokens(response.text)

        # Step 2: Build form data
        org_data = {
            "name": f"Test Organization {random.randint(1000, 9999)}",
            "address1": f"{random.randint(1, 999)} Test Street",
            "town": random.choice(["London", "Manchester", "Birmingham", "Leeds"]),
            "postcode": f"TE{random.randint(1, 9)} {random.randint(1, 9)}AA",
            "country": "England",
            "relationship": random.choice(["121480000", "121480001", "121480002"]),
        }

        # Build the form submission data
        prefix = "ctl00$ContentContainer$EntityFormControl_a73917b1e942f011877a6045bd0daffa$EntityFormControl_a73917b1e942f011877a6045bd0daffa_EntityFormView"

        form_data = {
            "__EVENTTARGET": "ctl00$ContentContainer$EntityFormControl_a73917b1e942f011877a6045bd0daffa$InsertButton",
            "__EVENTARGUMENT": "",
            "__VIEWSTATE": self.form_tokens.get("__VIEWSTATE", ""),
            "__VIEWSTATEGENERATOR": self.form_tokens.get("__VIEWSTATEGENERATOR", ""),
            "__EVENTVALIDATION": self.form_tokens.get("__EVENTVALIDATION", ""),
            # Only the required fields
            f"{prefix}$cg_organisationname": org_data["name"],
            f"{prefix}$cg_addressline1": org_data["address1"],
            f"{prefix}$cg_town": org_data["town"],
            f"{prefix}$cg_postcode": org_data["postcode"],
            f"{prefix}$cg_country": org_data["country"],
            f"{prefix}$cg_firstreporgrelationship": org_data["relationship"],
        }

        # Step 3: Submit the form
        with self.client.post(
            form_url,
            data=form_data,
            name="Submit Organization Form",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": f"{self.host}{form_url}",
                "Origin": self.host,
            },
            catch_response=True,
            allow_redirects=False,
        ) as response:

            if response.status_code == 302:
                location = response.headers.get("Location", "")

                if "AppID=" in location or "success" in location.lower():
                    response.success()
                    print(f"✅ User {self.user_id}: Form submitted!")
                else:
                    response.failure(f"Unexpected redirect: {location}")

            elif response.status_code == 200:
                # Check for errors
                if (
                    "error" in response.text.lower()
                    or "required" in response.text.lower()
                ):
                    response.failure("Form validation errors")
                    print(
                        f"❌ User {self.user_id}: Validation failed (probably wrong field names)"
                    )

                    # Print a snippet of the response to help debug
                    print(f"   Response snippet: {response.text[:500]}")
                else:
                    response.success()

            else:
                response.failure(f"Unexpected status: {response.status_code}")

    def extract_tokens(self, html_content):
        """Extract ASP.NET hidden fields from HTML"""

        patterns = {
            "__VIEWSTATE": r'(?:id|name)="__VIEWSTATE"[^>]*value="([^"]*)"',
            "__VIEWSTATEGENERATOR": r'(?:id|name)="__VIEWSTATEGENERATOR"[^>]*value="([^"]*)"',
            "__EVENTVALIDATION": r'(?:id|name)="__EVENTVALIDATION"[^>]*value="([^"]*)"',
        }

        for field_name, pattern in patterns.items():
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                self.form_tokens[field_name] = match.group(1)
                print(f"   Found {field_name}: {match.group(1)[:30]}...")
            else:
                print(f"   ⚠️  Missing {field_name}")


# Event listeners
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(
        f"""
    🌐 Portal Form Submission Load Test
    ====================================
    Target: {os.getenv('PORTAL_URL')}
    Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    ====================================
    """
    )


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print(
        f"""
    ✅ Test Complete
    ================
    Total Requests: {environment.stats.total.num_requests}
    Failed Requests: {environment.stats.total.num_failures}
    ================
    """
    )


if __name__ == "__main__":
    print("Run with: locust -f portal_with_form_submission.py")
