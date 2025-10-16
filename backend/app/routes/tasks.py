"""
Tasks Routes
"""
from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth, get_current_user_id
from app.services.supabase import SupabaseService

tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['GET'])
@require_auth
def get_project_tasks(project_id):
    """Get all tasks for a project"""
    user_id = get_current_user_id()
    
    try:
        tasks = SupabaseService.get_project_tasks(project_id, user_id)
        
        if tasks is None:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tasks_bp.route('/projects/<int:project_id>/tasks', methods=['POST'])
@require_auth
def create_task(project_id):
    """Create a new task"""
    user_id = get_current_user_id()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Task title is required'}), 400
    
    try:
        task = SupabaseService.create_task(project_id, data, user_id)
        
        if not task:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        return jsonify(task), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@require_auth
def update_task(task_id):
    """Update task"""
    user_id = get_current_user_id()
    data = request.get_json()
    
    try:
        task = SupabaseService.update_task(task_id, data, user_id)
        
        if not task:
            return jsonify({'error': 'Task not found or access denied'}), 404
        
        return jsonify(task), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id):
    """Delete task"""
    user_id = get_current_user_id()
    
    try:
        success = SupabaseService.delete_task(task_id, user_id)
        
        if not success:
            return jsonify({'error': 'Task not found or access denied'}), 404
        
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@tasks_bp.route('/my-tasks', methods=['GET'])
@require_auth
def get_my_tasks():
    """Get all tasks assigned to current user"""
    user_id = get_current_user_id()
    
    try:
        tasks = SupabaseService.get_user_tasks(user_id)
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500