"""
Authentication Middleware
"""
from functools import wraps
from flask import request, jsonify
from app.services.supabase import SupabaseService


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            # Extract token (format: "Bearer <token>")
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Verify token with Supabase
        user = SupabaseService.verify_user(token)
        
        if not user:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Attach user to request
        request.user = user.user
        request.user_id = user.user.id
        
        return f(*args, **kwargs)
    
    return decorated_function


def get_current_user():
    """Get current authenticated user from request"""
    return getattr(request, 'user', None)


def get_current_user_id():
    """Get current authenticated user ID from request"""
    return getattr(request, 'user_id', None)