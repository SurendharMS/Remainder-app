import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
import app.database as database
from app.database import MockSupabaseClient

# Ensure hermetic testing without external network dependency
database._supabase_client = MockSupabaseClient()

client = TestClient(app)

AUTH_HEADER_SURENDHAR = {"Authorization": "Bearer dev-token-Surendhar2252"}
AUTH_HEADER_UNAUTHORIZED = {"Authorization": "Bearer dev-token-Hacker404"}

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["authorized_user"] == "Surendhar2252"

def test_unauthorized_user_blocked():
    response = client.get("/api/tasks", headers=AUTH_HEADER_UNAUTHORIZED)
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]

def test_create_and_get_tasks():
    # 1. Create a once task
    due = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    new_task = {
        "title": "Fix critical production bug",
        "note": "Verify auth tokens and RLS",
        "recurrence_pattern": "once",
        "due_date": due,
    }
    create_resp = client.post("/api/tasks", json=new_task, headers=AUTH_HEADER_SURENDHAR)
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]

    # 2. Get pending tasks
    get_resp = client.get("/api/tasks", headers=AUTH_HEADER_SURENDHAR)
    assert get_resp.status_code == 200
    tasks = get_resp.json()
    assert any(t["id"] == created_id for t in tasks)

    # 3. Get with due_only filter
    due_resp = client.get("/api/tasks?due_only=true", headers=AUTH_HEADER_SURENDHAR)
    assert due_resp.status_code == 200
    due_tasks = due_resp.json()
    assert any(t["id"] == created_id for t in due_tasks)

def test_complete_once_task_and_history_hard_delete():
    # 1. Create a once task
    due = datetime.now(timezone.utc).isoformat()
    create_resp = client.post(
        "/api/tasks",
        json={
            "title": "One-time checklist item",
            "note": "To be moved to history upon completion",
            "recurrence_pattern": "once",
            "due_date": due,
        },
        headers=AUTH_HEADER_SURENDHAR,
    )
    task_id = create_resp.json()["id"]

    # 2. Complete the once task
    complete_resp = client.post(f"/api/tasks/{task_id}/complete", headers=AUTH_HEADER_SURENDHAR)
    assert complete_resp.status_code == 200
    completed_data = complete_resp.json()
    assert completed_data["status"] == "completed"
    assert completed_data["completed_at"] is not None

    # 3. Verify in history
    history_resp = client.get("/api/tasks/history", headers=AUTH_HEADER_SURENDHAR)
    assert history_resp.status_code == 200
    history_ids = [t["id"] for t in history_resp.json()]
    assert task_id in history_ids

    # 4. Hard-delete from history
    del_resp = client.delete(f"/api/tasks/history/{task_id}", headers=AUTH_HEADER_SURENDHAR)
    assert del_resp.status_code == 204

    # 5. Verify permanently deleted
    history_after = client.get("/api/tasks/history", headers=AUTH_HEADER_SURENDHAR)
    assert task_id not in [t["id"] for t in history_after.json()]

def test_complete_recurring_task():
    # 1. Create a daily task
    base_due = datetime(2026, 9, 17, 10, 0, 0, tzinfo=timezone.utc)
    create_resp = client.post(
        "/api/tasks",
        json={
            "title": "Morning standup & coffee",
            "note": "Daily recurring reminder",
            "recurrence_pattern": "daily",
            "due_date": base_due.isoformat(),
        },
        headers=AUTH_HEADER_SURENDHAR,
    )
    task_id = create_resp.json()["id"]

    # 2. Complete daily task -> status remains pending, due_date advances by 1 day
    complete_resp = client.post(f"/api/tasks/{task_id}/complete", headers=AUTH_HEADER_SURENDHAR)
    assert complete_resp.status_code == 200
    updated_data = complete_resp.json()
    assert updated_data["status"] == "pending"
    assert "2026-09-18" in updated_data["due_date"]

def test_important_dates_crud():
    # 1. Create important date
    create_resp = client.post(
        "/api/important-dates",
        json={"title": "Antigravity Release Party", "event_date": "2026-10-01"},
        headers=AUTH_HEADER_SURENDHAR,
    )
    assert create_resp.status_code == 201
    date_id = create_resp.json()["id"]
    assert create_resp.json()["days_remaining"] is not None

    # 2. List important dates
    list_resp = client.get("/api/important-dates", headers=AUTH_HEADER_SURENDHAR)
    assert list_resp.status_code == 200
    assert any(d["id"] == date_id for d in list_resp.json())

    # 3. Delete important date
    del_resp = client.delete(f"/api/important-dates/{date_id}", headers=AUTH_HEADER_SURENDHAR)
    assert del_resp.status_code == 204
