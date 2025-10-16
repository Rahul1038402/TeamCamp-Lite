"""
Authentication Routes
"""
from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth, get_current_user
from app.services.supabase import SupabaseService

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/verify', methods=['GET'])
@require_auth
def verify_token():
    """Verify JWT token and return user info"""
    user = get_current_user()
    
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'user_metadata': user.user_metadata
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user_info():
    """Get current user information"""
    user = get_current_user()
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'full_name': user.user_metadata.get('full_name', ''),
        'avatar_url': user.user_metadata.get('avatar_url', ''),
        'provider': user.app_metadata.get('provider', 'email')
    }), 200