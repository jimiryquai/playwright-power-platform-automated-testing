"""
Quick script to test if Playwright auth reuse is working
"""

import sys
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from helpers.playwright_auth import PlaywrightAuthReuser

def test_all_auth():
    """Test auth for all configured apps"""
    
    print("🔍 Testing Playwright Auth Reuse")
    print("=" * 50)
    
    apps = {
        'mda': 'auth/user.json',
        'portal': 'auth/auth.json',
        'public-file': 'auth/public-file.json'
    }
    
    results = []
    
    for app_name, auth_file in apps.items():
        print(f"\n📱 Testing {app_name.upper()}")
        print("-" * 30)
        
        auth_path = Path(__file__).parent.parent / auth_file
        
        if not auth_path.exists():
            print(f"❌ Auth file not found: {auth_file}")
            print(f"   Run: npm run setup:{app_name}")
            results.append((app_name, False, "File not found"))
            continue
        
        try:
            auth = PlaywrightAuthReuser(app_name)
            cookies = auth.get_cookies()
            print(f"✅ Found {len(cookies)} cookies")
            
            auth_header = auth.get_auth_header()
            if auth_header:
                print(f"✅ Found auth token")
            else:
                print(f"⚠️  No auth token found (might use cookies only)")
            
            results.append((app_name, True, f"{len(cookies)} cookies"))
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append((app_name, False, str(e)))
    
    print("\n" + "=" * 50)
    print("📊 Summary")
    print("=" * 50)
    
    for app, success, details in results:
        status = "✅" if success else "❌"
        print(f"{status} {app.upper()}: {details}")
    
    ready_apps = [app for app, success, _ in results if success]
    
    if ready_apps:
        print(f"\n🎯 Ready for load testing: {', '.join(ready_apps)}")
        print("\nRun load tests with:")
        for app in ready_apps:
            print(f"   npm run load:{app}")
    else:
        print("\n⚠️  No apps have valid authentication.")
        print("   Run Playwright auth setup first:")
        print("   npm run setup:mda")
        print("   npm run setup:portal")

if __name__ == "__main__":
    test_all_auth()
