"""
Files Routes
"""
from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth, get_current_user_id
from app.services.supabase import SupabaseService

files_bp = Blueprint('files', __name__)


@files_bp.route('/projects/<int:project_id>/files', methods=['GET'])
@require_auth
def get_project_files(project_id):
    """Get all files for a project"""
    user_id = get_current_user_id()
    
    try:
        files = SupabaseService.get_project_files(project_id, user_id)
        
        if files is None:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        return jsonify(files), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@files_bp.route('/projects/<int:project_id>/files', methods=['POST'])
@require_auth
def upload_file(project_id):
    """Upload file to project"""
    user_id = get_current_user_id()
    
    try:
        print(f"\n=== FILE UPLOAD DEBUG ===")
        print(f"Project ID: {project_id}")
        print(f"User ID: {user_id}")
        
        data = request.get_json()
        print(f"Request Data Keys: {data.keys() if data else 'None'}")
        print(f"Request Data: {data}")
        
        # Validate required fields
        required_fields = ['filename', 'file_path', 'file_size']
        if not all(field in data for field in required_fields):
            missing = [f for f in required_fields if f not in data]
            print(f"Missing fields: {missing}")
            return jsonify({'error': f'Missing required fields: {missing}'}), 400
        
        print(f"Calling SupabaseService.upload_file...")
        file_record = SupabaseService.upload_file(project_id, data, user_id)
        
        print(f"File record result: {file_record}")
        
        if not file_record:
            print("File record is None - access denied or project not found")
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        print(f"Success! Returning file record")
        return jsonify(file_record), 201
        
    except Exception as e:
        print(f"\n=== ERROR IN UPLOAD ===")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        
        import traceback
        print("\n=== FULL TRACEBACK ===")
        traceback.print_exc()
        print("=" * 50)
        
        return jsonify({'error': str(e)}), 500

@files_bp.route('/files/<int:file_id>', methods=['DELETE'])
@require_auth
def delete_file(file_id):
    """Delete file"""
    user_id = get_current_user_id()
    
    try:
        file_path = SupabaseService.delete_file(file_id, user_id)
        
        if not file_path:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        # Delete from Supabase Storage
        client = SupabaseService.get_client()
        bucket_name = 'project-files'
        
        try:
            client.storage.from_(bucket_name).remove([file_path])
        except Exception as storage_error:
            # Log error but don't fail the request
            print(f"Storage deletion error: {storage_error}")
        
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500