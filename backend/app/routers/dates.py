from datetime import date, datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_authorized_user
from app.database import get_supabase_client
from app.schemas import (
    AuthenticatedUser,
    ImportantDateCreate,
    ImportantDateResponse,
    ImportantDateUpdate,
)

router = APIRouter(prefix="/api/important-dates", tags=["important-dates"])


@router.get("", response_model=List[ImportantDateResponse])
async def list_important_dates(
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """
    List all important dates ordered chronologically by event_date,
    computing the days remaining for each date.
    """
    client = get_supabase_client()
    response = client.table("important_dates").select("*").order("event_date", desc=False).execute()

    today = date.today()
    results = []
    for item in response.data:
        event_d = datetime.strptime(item["event_date"], "%Y-%m-%d").date() if isinstance(item["event_date"], str) else item["event_date"]
        days_rem = (event_d - today).days
        item["days_remaining"] = days_rem
        results.append(item)

    return results


@router.post("", response_model=ImportantDateResponse, status_code=status.HTTP_201_CREATED)
async def create_important_date(
    date_in: ImportantDateCreate,
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """Create a new important date."""
    client = get_supabase_client()
    data = {
        "title": date_in.title,
        "event_date": date_in.event_date.isoformat(),
        "user_id": current_user.id if current_user.id else None,
    }
    response = client.table("important_dates").insert(data).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create important date"
        )
    created = response.data[0]
    event_d = datetime.strptime(created["event_date"], "%Y-%m-%d").date() if isinstance(created["event_date"], str) else created["event_date"]
    created["days_remaining"] = (event_d - date.today()).days
    return created


@router.put("/{date_id}", response_model=ImportantDateResponse)
async def update_important_date(
    date_id: str,
    date_in: ImportantDateUpdate,
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """Update an existing important date."""
    client = get_supabase_client()
    update_data = {}
    if date_in.title is not None:
        update_data["title"] = date_in.title
    if date_in.event_date is not None:
        update_data["event_date"] = date_in.event_date.isoformat()

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    response = client.table("important_dates").update(update_data).eq("id", date_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Important date not found.")

    updated = response.data[0]
    event_d = datetime.strptime(updated["event_date"], "%Y-%m-%d").date() if isinstance(updated["event_date"], str) else updated["event_date"]
    updated["days_remaining"] = (event_d - date.today()).days
    return updated


@router.delete("/{date_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_important_date(
    date_id: str,
    current_user: AuthenticatedUser = Depends(get_current_authorized_user),
):
    """Delete an important date."""
    client = get_supabase_client()
    response = client.table("important_dates").delete().eq("id", date_id).execute()
    return None
