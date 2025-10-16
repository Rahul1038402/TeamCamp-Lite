"""
Projects Routes
"""
from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth, get_current_user_id
from app.services.supabase import SupabaseService

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('', methods=['GET'])
@require_auth
def get_projects():
    """Get all projects for current user"""
    user_id = get_current_user_id()
    
    try:
        projects = SupabaseService.get_projects(user_id)
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('', methods=['POST'])
@require_auth
def create_project():
    """Create a new project"""
    user_id = get_current_user_id()
    data = request.get_json()
    
    print(f"DEBUG: Creating project for user: {user_id}")
    print(f"DEBUG: Request data: {data}")
    
    # Validate required fields
    if not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400
    
    try:
        project = SupabaseService.create_project(data, user_id)
        print(f"DEBUG: Project created: {project}")
        return jsonify(project), 201
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<int:project_id>', methods=['GET'])
@require_auth
def get_project(project_id):
    """Get project details"""
    user_id = get_current_user_id()
    
    try:
        project = SupabaseService.get_project_by_id(project_id, user_id)
        
        if not project:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        return jsonify(project), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<int:project_id>', methods=['PUT'])
@require_auth
def update_project(project_id):
    """Update project"""
    user_id = get_current_user_id()
    data = request.get_json()
    
    try:
        project = SupabaseService.update_project(project_id, data, user_id)
        
        if not project:
            return jsonify({'error': 'Project not found or insufficient permissions'}), 404
        
        return jsonify(project), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@require_auth
def delete_project(project_id):
    """Delete project"""
    user_id = get_current_user_id()
    
    try:
        success = SupabaseService.delete_project(project_id, user_id)
        
        if not success:
            return jsonify({'error': 'Project not found or insufficient permissions'}), 404
        
        return jsonify({'message': 'Project deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500