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
    
    def __init__(self, app_type: str = 'mda'):
        """
        Initialize auth reuser for specific app type.
        
        Args:
            app_type: One of 'mda', 'portal', or 'public-file'
        """
        self.app_type = app_type
        self.project_root = Path(__file__).parent.parent.parent  # Go up to project root
        self.auth_files = {
            'mda': self.project_root / 'auth' / 'user.json',
            'portal': self.project_root / 'auth' / 'auth.json',
            'public-file': self.project_root / 'auth' / 'public-file.json'
        }
        
        self.auth_file = self.auth_files.get(app_type)
        if not self.auth_file:
            raise ValueError(f"Unknown app type: {app_type}")
        
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
        
        # Check localStorage first (common for SPAs)
        for origin_data in self.auth_data.get('origins', []):
            for storage_item in origin_data.get('localStorage', []):
                # Look for access tokens in localStorage
                if 'token' in storage_item['name'].lower() or 'bearer' in storage_item['name'].lower():
                    value = storage_item['value']
                    
                    # If it's a JSON string, parse it
                    try:
                        parsed = json.loads(value)
                        # Look for access_token in the parsed object
                        if isinstance(parsed, dict):
                            if 'access_token' in parsed:
                                token = parsed['access_token']
                                print(f"✅ Found access token in localStorage")
                                return f"Bearer {token}"
                            elif 'accessToken' in parsed:
                                token = parsed['accessToken']
                                print(f"✅ Found accessToken in localStorage")
                                return f"Bearer {token}"
                    except json.JSONDecodeError:
                        # Not JSON, might be the token itself
                        if value and not value.startswith('{'):
                            print(f"✅ Found token in localStorage")
                            return f"Bearer {value}"
        
        # Check cookies for auth tokens (less common for API access)
        cookies = self.get_cookies()
        for name, value in cookies.items():
            if 'token' in name.lower() and value:
                print(f"✅ Found token in cookies: {name}")
                return f"Bearer {value}"
        
        print("⚠️  No Bearer token found in saved auth")
        return None
    
    def apply_auth_to_locust_client(self, client):
        """Apply authentication to a Locust HttpUser client"""
        # Add cookies
        cookies = self.get_cookies()
        for name, value in cookies.items():
            client.cookies.set(name, value)
        
        # Add auth header if available
        auth_header = self.get_auth_header()
        if auth_header:
            client.headers['Authorization'] = auth_header
        
        # For D365/MDA, add OData headers
        if self.app_type == 'mda':
            client.headers.update({
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Content-Type': 'application/json; charset=utf-8',
                'Prefer': 'odata.include-annotations="*"'
            })
        
        return client
    
    def debug_auth_data(self):
        """Print debug information about the saved auth"""
        if not self.auth_data:
            print("No auth data loaded")
            return
        
        print("\n🔍 Auth Data Debug Info:")
        print(f"   Cookies: {len(self.auth_data.get('cookies', []))}")
        
        for cookie in self.auth_data.get('cookies', [])[:5]:  # Show first 5
            print(f"     - {cookie['name']}: {cookie['value'][:20]}...")
        
        for origin_data in self.auth_data.get('origins', []):
            origin = origin_data.get('origin', 'unknown')
            print(f"\n   Origin: {origin}")
            print(f"     localStorage items: {len(origin_data.get('localStorage', []))}")
            
            for item in origin_data.get('localStorage', [])[:5]:  # Show first 5
                print(f"       - {item['name']}: {str(item['value'])[:30]}...")
