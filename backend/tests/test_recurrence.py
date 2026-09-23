from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import pytest

def calculate_next_due(current_due: datetime, pattern: str) -> datetime:
    if pattern == "daily":
        return current_due + relativedelta(days=1)
    elif pattern == "weekly":
        return current_due + relativedelta(weeks=1)
    elif pattern == "monthly":
        return current_due + relativedelta(months=1)
    elif pattern == "yearly":
        return current_due + relativedelta(years=1)
    raise ValueError(f"Unknown pattern: {pattern}")

def test_daily_recurrence():
    base = datetime(2026, 9, 17, 10, 0, 0, tzinfo=timezone.utc)
    next_due = calculate_next_due(base, "daily")
    assert next_due == datetime(2026, 9, 18, 10, 0, 0, tzinfo=timezone.utc)

def test_weekly_recurrence():
    base = datetime(2026, 9, 17, 10, 0, 0, tzinfo=timezone.utc)
    next_due = calculate_next_due(base, "weekly")
    assert next_due == datetime(2026, 9, 24, 10, 0, 0, tzinfo=timezone.utc)

def test_monthly_recurrence():
    base = datetime(2026, 9, 17, 10, 0, 0, tzinfo=timezone.utc)
    next_due = calculate_next_due(base, "monthly")
    assert next_due == datetime(2026, 10, 17, 10, 0, 0, tzinfo=timezone.utc)

def test_yearly_recurrence():
    base = datetime(2026, 9, 17, 10, 0, 0, tzinfo=timezone.utc)
    next_due = calculate_next_due(base, "yearly")
    assert next_due == datetime(2027, 9, 17, 10, 0, 0, tzinfo=timezone.utc)

def test_leap_year_monthly_edge_case():
    base = datetime(2024, 1, 31, 12, 0, 0, tzinfo=timezone.utc)
    next_due = calculate_next_due(base, "monthly")
    # In leap year 2024, Jan 31 + 1 month should be Feb 29
    assert next_due == datetime(2024, 2, 29, 12, 0, 0, tzinfo=timezone.utc)
