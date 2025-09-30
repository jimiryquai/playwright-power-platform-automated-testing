"""
Helper to reuse Playwright authentication in Locust load tests.
Reads the auth JSON files created by Playwright and extracts cookies/tokens.
"""

import json
import os
from typing import Dict, List, Optional
from pathlib import Path

class PlaywrightAuthReuser:
    """Extract and reuse authentication from Playwright's saved auth state"""
    
    def __init__(self, app_type: str = 'portal'):
        """
        Initialize auth reuser for specific app type.
        
        Args:
            app_type: One of 'portal' or 'public-file'
        """
        self.app_type = app_type
        self.project_root = Path(__file__).parent.parent.parent  # Go up to project root
        self.auth_files = {
            'portal': self.project_root / 'auth' / 'auth.json',
            'public-file': self.project_root / 'auth' / 'public-file.json'
        }
        
        self.auth_file = self.auth_files.get(app_type)
        if not self.auth_file:
            raise ValueError(f"Unknown app type: {app_type}. Valid options: 'portal', 'public-file'")
        
        self.auth_data = self._load_auth_data()
    
    def _load_auth_data(self) -> Optional[Dict]:
        """Load authentication data from Playwright's saved state"""
        if not self.auth_file.exists():
            print(f"⚠️  Auth file not found: {self.auth_file}")
            print(f"   Run Playwright auth setup first: npm run setup:{self.app_type}")
            return None
        
        try:
            with open(self.auth_file, 'r') as f:
                data = json.load(f)
                print(f"✅ Loaded auth from: {self.auth_file}")
                return data
        except Exception as e:
            print(f"❌ Failed to load auth file: {e}")
            return None
    
    def get_cookies(self) -> Dict[str, str]:
        """Extract cookies as a dictionary for use in Locust"""
        if not self.auth_data:
            return {}
        
        cookies = {}
        for cookie in self.auth_data.get('cookies', []):
            cookies[cookie['name']] = cookie['value']
        
        print(f"📦 Extracted {len(cookies)} cookies")
        return cookies
    
    def get_auth_header(self) -> Optional[str]:
        """Extract Bearer token from localStorage or cookies"""
        if not self.auth_data:
            return None
        
        # Try to find Bearer token in localStorage
        origins = self.auth_data.get('origins', [])
        for origin in origins:
            local_storage = origin.get('localStorage', [])
            for item in local_storage:
                if 'token' in item.get('name', '').lower():
                    return f"Bearer {item.get('value')}"
        
        return None
    
    def get_all_headers(self) -> Dict[str, str]:
        """Get common headers including auth if available"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        auth_header = self.get_auth_header()
        if auth_header:
            headers['Authorization'] = auth_header
        
        return headers


def test_auth_helper():
    """Test function to verify auth helper is working"""
    print("Testing Playwright Auth Reuser")
    print("=" * 50)
    
    apps = ['portal', 'public-file']
    
    for app in apps:
        print(f"\n📱 Testing {app.upper()}")
        print("-" * 30)
        
        try:
            auth = PlaywrightAuthReuser(app)
            
            if auth.auth_data:
                cookies = auth.get_cookies()
                print(f"✅ Cookies: {len(cookies)}")
                
                auth_header = auth.get_auth_header()
                if auth_header:
                    print(f"✅ Auth header: Present")
                else:
                    print(f"ℹ️  Auth header: Not found (using cookies only)")
            else:
                print(f"❌ No auth data loaded")
                
        except Exception as e:
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    test_auth_helper()