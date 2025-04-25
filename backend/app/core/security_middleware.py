from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time
from app.core.config import settings

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = {}
        
    def is_allowed(self, key: str) -> bool:
        now = time.time()
        minute_ago = now - 60
        
        if key not in self.requests:
            self.requests[key] = []
            
        # Clean old requests
        self.requests[key] = [req_time for req_time in self.requests[key] if req_time > minute_ago]
        
        if len(self.requests[key]) >= self.requests_per_minute:
            return False
            
        self.requests[key].append(now)
        return True

class SecurityMiddleware:
    def __init__(self):
        self.rate_limiter = RateLimiter(requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)
        self.security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
        
    async def __call__(self, request: Request, call_next):
        # Rate limiting
        client_ip = request.client.host
        if not self.rate_limiter.is_allowed(client_ip):
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )
            
        # Add security headers
        response = await call_next(request)
        for header, value in self.security_headers.items():
            response.headers[header] = value
            
        return response 