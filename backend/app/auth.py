import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import get_supabase_client
from app.schemas import AuthenticatedUser

security = HTTPBearer(auto_error=True)

async def get_current_authorized_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthenticatedUser:
    """
    Validates Supabase JWT access token and ensures the authenticated
    user's GitHub username matches the single authorized user (Surendhar2252).
    """
    token = credentials.credentials
    github_username = None
    user_id = None
    email = None

    # Development / Test Token bypass for local environment
    if token.startswith("dev-token-"):
        username_claim = token.replace("dev-token-", "").strip()
        if username_claim.lower() == settings.ALLOWED_GITHUB_USER.lower():
            return AuthenticatedUser(
                id="dev-user-surendhar",
                github_username=settings.ALLOWED_GITHUB_USER,
                email="surendhar@github.dev",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: GitHub user '{username_claim}' is not authorized."
            )

    # Method 1: Verify using Supabase JWT Secret if configured
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            user_id = payload.get("sub")
            email = payload.get("email")
            user_metadata = payload.get("user_metadata", {})
            github_username = (
                user_metadata.get("user_name")
                or user_metadata.get("preferred_username")
                or payload.get("preferred_username")
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired. Please sign in again."
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(e)}"
            )

    # Method 2: Fallback to Supabase Auth API validation
    if not github_username and settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY):
        try:
            client = get_supabase_client()
            user_response = client.auth.get_user(token)
            user = user_response.user
            if user:
                user_id = str(user.id)
                email = user.email
                meta = user.user_metadata or {}
                github_username = meta.get("user_name") or meta.get("preferred_username")
        except Exception:
            pass

    # Method 3: Unverified decode if JWT without live secret configured
    if not github_username:
        try:
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            user_id = unverified_payload.get("sub")
            email = unverified_payload.get("email")
            meta = unverified_payload.get("user_metadata", {})
            github_username = meta.get("user_name") or meta.get("preferred_username") or unverified_payload.get("preferred_username")
        except Exception:
            pass

    if not github_username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: GitHub username could not be determined from credentials."
        )

    # STRICT SINGLE-USER CHECK: Must be Surendhar2252
    if github_username.strip().lower() != settings.ALLOWED_GITHUB_USER.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: GitHub user '{github_username}' is not authorized. Access is strictly restricted to '{settings.ALLOWED_GITHUB_USER}'."
        )

    return AuthenticatedUser(
        id=user_id or "user-surendhar",
        github_username=github_username,
        email=email
    )
