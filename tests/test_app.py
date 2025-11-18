import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_activity():
    # Get an activity name
    activities = client.get("/activities").json()
    if not activities:
        pytest.skip("No activities available to test signup.")
    activity_name = list(activities.keys())[0]
    email = "testuser@mergington.edu"
    # Sign up
    signup_url = f"/activities/{activity_name}/signup?email={email}"
    response = client.post(signup_url)
    assert response.status_code in (200, 400)  # 400 if already signed up
    # Check participant is in the list (if not already present)
    updated_activities = client.get("/activities").json()
    assert email in updated_activities[activity_name]["participants"]

def test_signup_invalid_activity():
    response = client.post("/activities/NonExistentActivity/signup?email=someone@mergington.edu")
    assert response.status_code == 404

def test_signup_invalid_email():
    # Get an activity name
    activities = client.get("/activities").json()
    if not activities:
        pytest.skip("No activities available to test signup.")
    activity_name = list(activities.keys())[0]
    # Invalid email
    response = client.post(f"/activities/{activity_name}/signup?email=notanemail")
    assert response.status_code == 400
