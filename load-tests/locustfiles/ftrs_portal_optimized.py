from locust import HttpUser, task, between
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import os
import time
import random
from urllib.parse import urlencode

load_dotenv()

class FTRSPortalUser(HttpUser):
    host = os.getenv('PORTAL_URL')
    wait_time = between(1, 5)
    
    def on_start(self):
        """Initialize session - cookies are automatically maintained by Locust"""
        print(f"Starting user session for {self.host}")
        # Initial visit to establish session
        response = self.client.get("/")
        print(f"Session established: {response.status_code}")
    
    def extract_form_fields(self, html_content):
        """Extract all form fields including hidden ASP.NET fields"""
        soup = BeautifulSoup(html_content, 'html.parser')
        form_data = {}
        
        # Find the main form
        form = soup.find('form')
        if not form:
            print("No form found on page")
            return form_data
        
        # Extract ALL input fields
        for input_field in form.find_all('input'):
            name = input_field.get('name')
            if name:
                # Get value or default to empty string
                value = input_field.get('value', '')
                form_data[name] = value
                
                # Debug: Show what we're extracting
                if name in ['__VIEWSTATE', '__VIEWSTATEGENERATOR', '__EVENTVALIDATION', '__RequestVerificationToken']:
                    print(f"Found {name}: {value[:50]}..." if len(value) > 50 else f"Found {name}: {value}")
        
        # Extract select fields
        for select in form.find_all('select'):
            name = select.get('name')
            if name:
                # Get first option value as default
                option = select.find('option', {'selected': True}) or select.find('option')
                form_data[name] = option.get('value', '') if option else ''
        
        # Extract textareas
        for textarea in form.find_all('textarea'):
            name = textarea.get('name')
            if name:
                form_data[name] = textarea.text or ''
        
        print(f"Extracted {len(form_data)} form fields")
        return form_data
    
    @task(10)
    def load_form_only(self):
        """Just load the form page"""
        response = self.client.get(
            "/New-Application-Organisation-Information/",
            name="Load Organisation Form"
        )
        print(f"Form load: {response.status_code}")
    
    @task(30)
    def submit_organisation_form(self):
        """Load form, extract fields, and submit"""
        
        # Step 1: GET the form page
        print("Loading form page...")
        response = self.client.get(
            "/New-Application-Organisation-Information/",
            name="Load Form Before Submit"
        )
        
        if response.status_code != 200:
            print(f"Failed to load form: {response.status_code}")
            return
        
        # Step 2: Extract ALL form fields
        form_data = self.extract_form_fields(response.text)
        
        if not form_data:
            print("No form data extracted, skipping submission")
            return
        
        # Step 3: Update with our test data (keeping all hidden fields intact)
        # Only update the fields you want to change
        test_id = f"{random.randint(1000, 9999)}_{int(time.time())}"
        
        # Update only user-editable fields
        # You'll need to check the actual field names from the form
        form_data.update({
            'OrganisationName': f'Test Organisation {test_id}',  # Adjust field name
            'OrganisationEmail': f'test_{test_id}@example.com',  # Adjust field name
            'OrganisationPhone': f'020 {random.randint(1000, 9999)} {random.randint(1000, 9999)}',  # Adjust field name
            # Add other fields as needed - check actual field names from browser DevTools
        })
        
        # Step 4: Submit with proper headers
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cache-Control': 'max-age=0',
            'Origin': self.host,
            'Referer': f'{self.host}/New-Application-Organisation-Information/'
        }
        
        # Submit the form
        with self.client.post(
            "/New-Application-Organisation-Information/",
            data=form_data,  # Locust will URL-encode this
            headers=headers,
            name="Submit Organisation Form",
            catch_response=True,
            allow_redirects=False  # Handle redirects manually to see what happens
        ) as response:
            if response.status_code == 302 or response.status_code == 303:
                # Success - form redirects after submission
                location = response.headers.get('Location', '')
                print(f"Form submitted successfully, redirected to: {location}")
                response.success()
            elif response.status_code == 200:
                # Check if it's a success or error page
                if "error" in response.text.lower() or "required" in response.text.lower():
                    print("Form validation errors")
                    response.failure("Form validation failed")
                else:
                    response.success()
            else:
                print(f"Unexpected response: {response.status_code}")
                response.failure(f"Got status {response.status_code}")
    
    @task(5)
    def submit_minimal_form(self):
        """Simpler version - just test the submission mechanism"""
        
        # Get form
        response = self.client.get("/New-Application-Organisation-Information/")
        
        # Extract hidden fields only
        soup = BeautifulSoup(response.text, 'html.parser')
        form_data = {}
        
        # Get only the essential hidden fields
        for input_field in soup.find_all('input', type='hidden'):
            name = input_field.get('name')
            if name:
                form_data[name] = input_field.get('value', '')
        
        # Add minimal test data
        form_data['test_field'] = 'test_value'
        
        # Submit
        response = self.client.post(
            "/New-Application-Organisation-Information/",
            data=form_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            name="Submit Minimal Form"
        )
        print(f"Minimal submit: {response.status_code}")


class SimpleFormTest(HttpUser):
    """Debug version to see what's in the form"""
    host = os.getenv('PORTAL_URL')
    wait_time = between(5, 10)
    
    @task
    def inspect_form(self):
        """Load form and show what fields exist"""
        response = self.client.get("/New-Application-Organisation-Information/")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            form = soup.find('form')
            
            if form:
                print("\n=== FORM FIELDS ===")
                
                # Show all input fields
                for input_field in form.find_all('input'):
                    name = input_field.get('name', 'NO_NAME')
                    type_ = input_field.get('type', 'text')
                    value = input_field.get('value', '')
                    
                    if type_ == 'hidden':
                        print(f"Hidden: {name} = {value[:30]}..." if len(value) > 30 else f"Hidden: {name} = {value}")
                    else:
                        print(f"Input[{type_}]: {name}")
                
                # Show select fields
                for select in form.find_all('select'):
                    print(f"Select: {select.get('name', 'NO_NAME')}")
                
                # Show textareas
                for textarea in form.find_all('textarea'):
                    print(f"Textarea: {textarea.get('name', 'NO_NAME')}")
                
                print("==================\n")
            else:
                print("No form found on page")