from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime, timezone
from supabase import create_client, Client
from app.config import settings

_supabase_client: Optional[Client] = None

class MockTableQuery:
    def __init__(self, table_name: str, storage: List[Dict[str, Any]]):
        self.table_name = table_name
        self.storage = storage
        self._data = list(storage)
        self._action = "select"
        self._insert_data = None
        self._update_data = None
        self._delete_match = False
        self._filters = []

    def select(self, columns: str = "*"):
        self._action = "select"
        return self

    def insert(self, data: Dict[str, Any]):
        self._action = "insert"
        if not isinstance(data, list):
            data = [data]
        self._insert_data = data
        return self

    def update(self, data: Dict[str, Any]):
        self._action = "update"
        self._update_data = data
        return self

    def delete(self):
        self._action = "delete"
        return self

    def eq(self, column: str, value: Any):
        self._filters.append(lambda row: str(row.get(column)) == str(value))
        return self

    def lte(self, column: str, value: Any):
        self._filters.append(lambda row: str(row.get(column) or "") <= str(value))
        return self

    def order(self, column: str, desc: bool = False):
        self._data.sort(key=lambda r: str(r.get(column) or ""), reverse=desc)
        return self

    def execute(self):
        class Result:
            def __init__(self, data):
                self.data = data

        if self._action == "insert":
            inserted = []
            for item in self._insert_data:
                record = dict(item)
                if "id" not in record:
                    record["id"] = str(uuid.uuid4())
                if "created_at" not in record:
                    record["created_at"] = datetime.now(timezone.utc).isoformat()
                self.storage.append(record)
                inserted.append(record)
            return Result(inserted)

        # Apply filters
        matched = [r for r in self.storage if all(f(r) for f in self._filters)]

        if self._action == "update":
            updated_records = []
            for r in matched:
                r.update(self._update_data)
                updated_records.append(r)
            return Result(updated_records)

        elif self._action == "delete":
            for r in matched:
                if r in self.storage:
                    self.storage.remove(r)
            return Result(matched)

        return Result(matched)


class MockSupabaseClient:
    def __init__(self):
        self._tables: Dict[str, List[Dict[str, Any]]] = {
            "tasks": [
                {
                    "id": "task-sample-1",
                    "title": "Review GitHub OAuth RLS policies",
                    "note": "Verify that only Surendhar2252 has read/write privileges.",
                    "recurrence_pattern": "once",
                    "status": "pending",
                    "due_date": datetime.now(timezone.utc).isoformat(),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "completed_at": None,
                },
                {
                    "id": "task-sample-2",
                    "title": "Daily engineering journal",
                    "note": "Write summary of daily commits and progress.",
                    "recurrence_pattern": "daily",
                    "status": "pending",
                    "due_date": datetime.now(timezone.utc).isoformat(),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "completed_at": None,
                },
            ],
            "important_dates": [
                {
                    "id": "date-sample-1",
                    "title": "Project Launch Day",
                    "event_date": "2026-09-25",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            ],
        }

    def table(self, table_name: str):
        if table_name not in self._tables:
            self._tables[table_name] = []
        return MockTableQuery(table_name, self._tables[table_name])


def get_supabase_client() -> Any:
    """
    Returns live Supabase client if credentials exist;
    otherwise falls back to development local mock client.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    if settings.SUPABASE_URL and key:
        _supabase_client = create_client(settings.SUPABASE_URL, key)
        return _supabase_client

    # Fallback to local dev mock store
    _supabase_client = MockSupabaseClient()
    return _supabase_client
