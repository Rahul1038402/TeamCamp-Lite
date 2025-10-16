"""
Project Members Routes
"""
from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth, get_current_user_id
from app.services.supabase import SupabaseService

members_bp = Blueprint('members', __name__)


@members_bp.route('/projects/<int:project_id>/members', methods=['GET'])
@require_auth
def get_project_members(project_id):
    """Get all members (auth + guest)"""
    user_id = get_current_user_id()
    
    try:
        members = SupabaseService.get_all_project_members(project_id, user_id)
        
        if members is None:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        return jsonify(members), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@members_bp.route('/projects/<int:project_id>/members', methods=['POST'])
@require_auth
def add_project_member(project_id):
    """Add guest member to project"""
    user_id = get_current_user_id()
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Member name is required'}), 400
    
    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        member = SupabaseService.add_guest_member(
            project_id,
            data['name'],
            data['email'],
            data.get('role', 'member'),
            user_id
        )
        
        if not member:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        return jsonify(member), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@members_bp.route('/projects/<int:project_id>/members/<int:member_id>', methods=['DELETE'])
@require_auth
def remove_project_member(project_id, member_id):
    """Remove guest member"""
    user_id = get_current_user_id()
    
    try:
        success = SupabaseService.remove_guest_member(project_id, member_id, user_id)
        
        if not success:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        return jsonify({'message': 'Member removed'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@members_bp.route('/projects/<int:project_id>/members/<int:member_id>', methods=['PUT'])
@require_auth
def update_project_member(project_id, member_id):
    """Update guest member role"""
    user_id = get_current_user_id()
    data = request.get_json()
    
    if not data.get('role'):
        return jsonify({'error': 'Role is required'}), 400
    
    try:
        member = SupabaseService.update_guest_member(
            project_id, member_id, data['role'], user_id
        )
        
        if not member:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        return jsonify(member), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

