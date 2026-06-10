#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class NeuraLearnAPITester:
    def __init__(self, base_url="https://a11y-learning-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            details = ""
            
            if not success:
                details = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - Response: {response.text[:200]}"
            
            self.log_result(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            else:
                return {}

        except requests.exceptions.RequestException as e:
            details = f"Request failed: {str(e)}"
            self.log_result(name, False, details)
            return {}

    def test_health_check(self):
        """Test API health endpoint"""
        response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return response.get("status") == "healthy"

    def test_admin_login(self):
        """Test admin login"""
        response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@neuralearn.com", "password": "Admin123!"}
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✓ Token received: {self.token[:20]}...")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user with token"""
        if not self.token:
            self.log_result("Get Current User", False, "No token available")
            return False
            
        response = self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )
        
        if response and 'user' in response:
            user = response['user']
            print(f"   ✓ User: {user.get('name', 'Unknown')} ({user.get('email', 'No email')})")
            return True
        return False

    def test_user_registration(self):
        """Test user registration with full fields"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_user_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@neuralearn.com",
            "password": "TestPass123!",
            "disability_type": "visual_impairment",
            "grade_level": "class_5",
            "learning_style": "auditory",
            "avatar": "fox"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=test_user_data
        )
        
        if response and 'user' in response and 'access_token' in response:
            user = response['user']
            print(f"   ✓ Registered user: {user.get('name')} with avatar: {user.get('avatar')}")
            return True
        return False

    def test_get_lessons(self):
        """Test getting lessons list"""
        response = self.run_test(
            "Get Lessons",
            "GET",
            "api/lessons",
            200
        )
        
        if response and 'lessons' in response:
            lessons = response['lessons']
            print(f"   ✓ Found {len(lessons)} lessons")
            if lessons:
                print(f"   ✓ Sample lesson: {lessons[0].get('title', 'No title')}")
            return True
        return False

    def test_get_knowledge_graph(self):
        """Test getting knowledge graph"""
        response = self.run_test(
            "Get Knowledge Graph",
            "GET",
            "api/knowledge-graph",
            200
        )
        
        if response and 'concepts' in response:
            concepts = response['concepts']
            print(f"   ✓ Found {len(concepts)} concepts")
            if concepts:
                print(f"   ✓ Sample concept: {concepts[0].get('name', 'No name')}")
            return True
        return False

    def test_get_analytics(self):
        """Test getting analytics (requires auth)"""
        if not self.token:
            self.log_result("Get Analytics", False, "No token available")
            return False
            
        response = self.run_test(
            "Get Analytics",
            "GET",
            "api/analytics",
            200
        )
        
        if response and 'sessions' in response:
            print(f"   ✓ Analytics data retrieved")
            return True
        return False

    def test_lesson_submission(self):
        """Test lesson quiz submission"""
        if not self.token:
            self.log_result("Lesson Quiz Submission", False, "No token available")
            return False
            
        # First get a lesson to submit
        lessons_response = self.run_test(
            "Get Lesson for Quiz",
            "GET",
            "api/lessons",
            200
        )
        
        if not lessons_response or not lessons_response.get('lessons'):
            return False
            
        lesson = lessons_response['lessons'][0]
        lesson_id = lesson.get('id')
        
        if not lesson_id:
            self.log_result("Lesson Quiz Submission", False, "No lesson ID found")
            return False
        
        # Submit quiz answers
        quiz_data = {
            "lesson_id": lesson_id,
            "answers": {"q1": "5", "q2": "5", "q3": "6"},  # Some sample answers
            "time_spent_seconds": 120
        }
        
        response = self.run_test(
            "Submit Lesson Quiz",
            "POST",
            "api/lessons/submit-quiz",
            200,
            data=quiz_data
        )
        
        if response and 'score' in response:
            print(f"   ✓ Quiz submitted, score: {response.get('score')}%")
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("🚀 Starting NeuraLearn API Tests")
        print("=" * 60)
        
        # Test health check first
        if not self.test_health_check():
            print("\n❌ Health check failed - API may be down")
            return False
        
        # Test admin login
        if not self.test_admin_login():
            print("\n❌ Admin login failed - cannot proceed with authenticated tests")
        
        # Test other endpoints
        self.test_get_current_user()
        self.test_user_registration()
        self.test_get_lessons()
        self.test_get_knowledge_graph()
        self.test_get_analytics()
        self.test_lesson_submission()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test runner"""
    tester = NeuraLearnAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())