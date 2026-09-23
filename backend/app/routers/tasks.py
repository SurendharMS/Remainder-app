from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from dateutil.relativedelta import relativedelta

from app.auth import get_current_authorized_user
from app.database import get_supabase_client
from app.schemas import AuthenticatedUser, TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    due_only: bool = Query(
        False,
        description="Optionally filter tasks where due_date <= now()"
    ),
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """
    Fetch tasks where status = 'pending'.
    If due_only is True, filters to only tasks where due_date <= current UTC time.
    Secured: Accessible only by authorized user Surendhar2252.
    """
    client = get_supabase_client()
    query = client.table("tasks").select("*").eq("status", "pending")

    if due_only:
        now_utc = datetime.now(timezone.utc).isoformat()
        query = query.lte("due_date", now_utc)

    # Order pending tasks chronologically by due_date
    query = query.order("due_date", desc=False)
    response = query.execute()

    return response.data


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """
    Create a new task with pending status.
    """
    client = get_supabase_client()
    data = {
        "title": task_in.title,
        "note": task_in.note,
        "recurrence_pattern": task_in.recurrence_pattern,
        "due_date": task_in.due_date.isoformat(),
        "status": "pending",
        "user_id": current_user.id if current_user.id else None,
    }

    response = client.table("tasks").insert(data).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create task"
        )
    return response.data[0]


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """
    Complete or advance a task based on its recurrence_pattern:
    - If recurrence_pattern == 'once': status -> 'completed', completed_at -> now().
    - If recurrence_pattern in ('daily', 'weekly', 'monthly', 'yearly'):
      Uses dateutil.relativedelta to advance due_date to next period, keeping status as 'pending'.
    """
    client = get_supabase_client()

    # 1. Fetch the task
    fetch_resp = client.table("tasks").select("*").eq("id", task_id).execute()
    if not fetch_resp.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found."
        )

    task = fetch_resp.data[0]
    pattern = task.get("recurrence_pattern", "once")
    raw_due_date = task.get("due_date")

    # 2. Parse current due_date into timezone-aware datetime
    if isinstance(raw_due_date, str):
        current_due = datetime.fromisoformat(raw_due_date.replace("Z", "+00:00"))
    elif isinstance(raw_due_date, datetime):
        current_due = raw_due_date
    else:
        current_due = datetime.now(timezone.utc)

    # 3. Apply recurrence logic
    now_utc = datetime.now(timezone.utc)
    update_data = {}

    if pattern == "once":
        # Transition to completed with completion timestamp
        update_data = {
            "status": "completed",
            "completed_at": now_utc.isoformat(),
        }
    elif pattern == "daily":
        next_due = current_due + relativedelta(days=1)
        update_data = {
            "due_date": next_due.isoformat(),
            "status": "pending",
        }
    elif pattern == "weekly":
        next_due = current_due + relativedelta(weeks=1)
        update_data = {
            "due_date": next_due.isoformat(),
            "status": "pending",
        }
    elif pattern == "monthly":
        next_due = current_due + relativedelta(months=1)
        update_data = {
            "due_date": next_due.isoformat(),
            "status": "pending",
        }
    elif pattern == "yearly":
        next_due = current_due + relativedelta(years=1)
        update_data = {
            "due_date": next_due.isoformat(),
            "status": "pending",
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown recurrence pattern: '{pattern}'"
        )

    # 4. Update the task in Supabase
    update_resp = (
        client.table("tasks")
        .update(update_data)
        .eq("id", task_id)
        .execute()
    )

    if not update_resp.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task recurrence state."
        )

    return update_resp.data[0]


@router.get("/history", response_model=List[TaskResponse])
async def get_history(
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """
    Fetch all 'completed' tasks ordered by completed_at descending (work journal).
    """
    client = get_supabase_client()
    response = (
        client.table("tasks")
        .select("*")
        .eq("status", "completed")
        .order("completed_at", desc=True)
        .execute()
    )
    return response.data


@router.delete("/history/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history_task(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """
    Hard-delete endpoint to permanently erase a specific completed task from history.
    """
    client = get_supabase_client()

    # Verify task exists and is completed before hard deleting
    fetch_resp = client.table("tasks").select("id, status").eq("id", task_id).execute()
    if not fetch_resp.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found."
        )

    del_resp = client.table("tasks").delete().eq("id", task_id).execute()
    return None
