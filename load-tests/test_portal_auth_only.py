# load-tests/test_portal_auth_only.py
"""
Simple script to test if portal authentication is working
Run this BEFORE doing full load tests to verify auth setup
"""

import os
import sys
from pathlib import Path
import requests
import urllib3

# Disable SSL warnings (for corporate environments with SSL inspection)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

sys.path.append(str(Path(__file__).parent))

from helpers.playwright_auth import PlaywrightAuthReuser

def test_portal_auth():
    """Test portal authentication without Locust"""
    
    print("🔐 Testing Portal Authentication")
    print("=" * 60)
    
    # Get portal URL
    portal_url = os.getenv('PORTAL_URL', 'https://ftrs-test.powerappsportals.com')
    print(f"\n🌐 Target: {portal_url}")
    
    # Load Playwright auth
    print("\n📦 Loading Playwright authentication...")
    try:
        auth = PlaywrightAuthReuser('portal')
        cookies = auth.get_cookies()
        print(f"✅ Loaded {len(cookies)} cookies from auth/auth.json")
        
        # Show which cookies we got
        print("\n🍪 Key cookies found:")
        for name in list(cookies.keys())[:5]:  # Show first 5
            print(f"   - {name}")
            
        if 'Dynamics365PortalAnalytics' not in cookies:
            print("   ⚠️  WARNING: Missing Dynamics365PortalAnalytics cookie")
            
        if 'PrivateModeLoginCookie' not in cookies:
            print("   ⚠️  WARNING: Missing PrivateModeLoginCookie")
            
    except Exception as e:
        print(f"❌ Failed to load auth: {e}")
        print("\n💡 Fix: Run 'npm run setup:portal' first")
        return False
    
    # Test 1: Homepage
    print("\n🏠 Test 1: Accessing homepage...")
    try:
        session = requests.Session()
        
        # Apply cookies
        for name, value in cookies.items():
            session.cookies.set(name, value)
        
        # Disable SSL verification for corporate environments
        response = session.get(f"{portal_url}/", timeout=10, verify=False)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            # Check if we're logged in
            if 'sign in' in response.text.lower() or 'log in' in response.text.lower():
                print("   ⚠️  Got homepage but seems we're NOT logged in")
                print("   💡 Auth cookies might have expired - run 'npm run setup:portal'")
                return False
            else:
                print("   ✅ Successfully accessed homepage (appears logged in)")
        elif response.status_code == 302:
            print(f"   ⚠️  Redirected to: {response.headers.get('Location', 'unknown')}")
            print("   💡 This might mean auth expired")
            return False
        else:
            print(f"   ❌ Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error accessing homepage: {e}")
        return False
    
    # Test 2: Form Page
    print("\n📋 Test 2: Accessing form page...")
    form_url = "/New-Application-Organisation-Information/"
    
    try:
        response = session.get(f"{portal_url}{form_url}", timeout=10, verify=False)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            # Check for ASP.NET form elements
            has_viewstate = '__VIEWSTATE' in response.text
            has_validation = '__EVENTVALIDATION' in response.text
            
            print(f"   ✅ Form page loaded")
            print(f"   __VIEWSTATE found: {'✅' if has_viewstate else '❌'}")
            print(f"   __EVENTVALIDATION found: {'✅' if has_validation else '❌'}")
            
            if has_viewstate and has_validation:
                print("   ✅ Form has all required ASP.NET hidden fields")
            else:
                print("   ⚠️  Form might not be an ASP.NET form (unexpected)")
                
        elif response.status_code == 302:
            location = response.headers.get('Location', 'unknown')
            print(f"   ⚠️  Redirected to: {location}")
            
            if 'signin' in location.lower() or 'login' in location.lower():
                print("   ❌ Being redirected to login - auth not working")
                return False
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error accessing form: {e}")
        return False
    
    # Test 3: Check auth cookie validity
    print("\n⏰ Test 3: Checking cookie expiry...")
    try:
        # The PrivateModeLoginCookie is the main auth cookie
        for cookie in session.cookies:
            if cookie.name == 'PrivateModeLoginCookie':
                if cookie.expires:
                    from datetime import datetime
                    expiry = datetime.fromtimestamp(cookie.expires)
                    now = datetime.now()
                    
                    if expiry > now:
                        time_left = expiry - now
                        print(f"   ✅ PrivateModeLoginCookie valid for {time_left}")
                    else:
                        print(f"   ❌ PrivateModeLoginCookie EXPIRED")
                        print(f"   💡 Run 'npm run setup:portal' to refresh")
                        return False
                else:
                    print(f"   ✅ PrivateModeLoginCookie (session cookie - no expiry)")
                break
        else:
            print("   ⚠️  PrivateModeLoginCookie not found in session")
            
    except Exception as e:
        print(f"   ⚠️  Could not check expiry: {e}")
    
    print("\n" + "=" * 60)
    print("✅ AUTHENTICATION TEST PASSED")
    print("\nYou're ready to run load tests with:")
    print("   locust -f locustfiles/portal_with_form_submission.py")
    print("=" * 60)
    
    return True


if __name__ == '__main__':
    success = test_portal_auth()
    exit(0 if success else 1)