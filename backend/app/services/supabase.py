"""
Supabase Service - Database interactions
"""
from supabase import create_client, Client
from app.config import Config
import jwt
from datetime import datetime

class SupabaseService:
    """Supabase database service"""
    
    _client: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client"""
        if cls._client is None:
            cls._client = create_client(
                Config.SUPABASE_URL,
                Config.SUPABASE_KEY
            )
        return cls._client
    
    @classmethod
    def verify_user(cls, access_token: str):
        """Verify user from Supabase JWT token"""
        try:
            # Decode and verify JWT token
            payload = jwt.decode(
                access_token,
                Config.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            
            # Check if token is expired
            if payload.get('exp') and payload['exp'] < datetime.now().timestamp():
                print("Token expired")
                return None
            
            # Create a user object similar to Supabase response
            class User:
                def __init__(self, payload):
                    self.user = type('obj', (object,), {
                        'id': payload.get('sub'),
                        'email': payload.get('email'),
                        'role': payload.get('role'),
                        'user_metadata': payload.get('user_metadata', {})
                    })
            
            return User(payload)
            
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return None
        except Exception as e:
            print(f"Error verifying token: {str(e)}")
            return None
    
    # Projects
    @classmethod
    def get_projects(cls, user_id: str):
        """Get all projects for a user (created by them OR where they're a member)"""
        client = cls.get_client()
        
        # Get projects created by user
        created_projects = client.table('projects').select('*').eq(
            'created_by', user_id
        ).execute()
        
        # Get projects where user is a member
        member_response = client.table('project_members').select(
            'project_id, role, projects(*)'
        ).eq('user_id', user_id).execute()
        
        # Combine both lists
        projects = []
        
        # Add created projects
        if created_projects.data:
            for project in created_projects.data:
                project['role'] = 'owner'  # Creator is owner
                project['is_creator'] = True
                projects.append(project)
        
        # Add member projects (avoid duplicates)
        project_ids = [p['id'] for p in projects]
        if member_response.data:
            for member in member_response.data:
                if member.get('projects') and member['projects']['id'] not in project_ids:
                    project = member['projects']
                    project['role'] = member['role']
                    project['is_creator'] = False
                    projects.append(project)
        
        return projects

    
    @classmethod
    def create_project(cls, data, user_id):
        """Create a new project"""
        try:
            client = cls.get_client()
            
            # Insert project
            project_data = {
                'name': data['name'],
                'description': data.get('description'),
                'status': data.get('status', 'active'),
                'start_date': data.get('start_date'),
                'end_date': data.get('end_date'),
                'created_by': user_id
            }
            
            response = client.table('projects').insert(project_data).execute()
            
            if not response.data:
                raise Exception('Failed to create project')
            
            project = response.data[0]
            
            # REMOVED: Don't auto-add creator as member
            # Let them manually invite people instead
            
            return project
            
        except Exception as e:
            print(f"Error creating project: {str(e)}")
            raise
    
    @classmethod
    def get_project_by_id(cls, project_id: int, user_id: str):
        """Get project details"""
        client = cls.get_client()
        
        # Get project
        project = client.table('projects').select('*').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Check if user is creator OR a member
        if project.data[0]['created_by'] == user_id:
            return project.data[0]
        
        member_check = client.table('project_members').select('*').eq(
            'project_id', project_id
        ).eq('user_id', user_id).execute()
        
        if member_check.data:
            return project.data[0]
        
        return None
    
    @classmethod
    def update_project(cls, project_id: int, data: dict, user_id: str):
        """Update project"""
        client = cls.get_client()
        
        # Get project to check creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR admin/owner members
        if project.data[0]['created_by'] == user_id:
            response = client.table('projects').update(data).eq('id', project_id).execute()
            return response.data[0] if response.data else None
        
        # Check if member is admin
        member = client.table('project_members').select('role').eq(
            'project_id', project_id
        ).eq('user_id', user_id).execute()
        
        if member.data and member.data[0]['role'] in ['owner', 'admin']:
            response = client.table('projects').update(data).eq('id', project_id).execute()
            return response.data[0] if response.data else None
        
        return None
    
    @classmethod
    def delete_project(cls, project_id: int, user_id: str):
        """Delete project - only creator can delete"""
        client = cls.get_client()
        
        # Get project to check creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return False
        
        # Only creator can delete project
        if project.data[0]['created_by'] != user_id:
            return False
        
        # Delete project (cascade will handle related records)
        client.table('projects').delete().eq('id', project_id).execute()
        
        return True
    
    # Tasks
    @classmethod
    def get_project_tasks(cls, project_id: int, user_id: str):
        """Get all tasks for a project"""
        client = cls.get_client()
        
        # Get project to check if user is creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR members to view tasks
        is_creator = project.data[0]['created_by'] == user_id
        
        if not is_creator:
            # Check if user is a member
            member_check = client.table('project_members').select('*').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data:
                # Also check guest_members if you implemented that
                guest_check = client.table('guest_members').select('*').eq(
                    'project_id', project_id
                ).eq('email', user_id).execute()  # Assuming email match
                
                if not guest_check.data:
                    return None
        
        # Get tasks with assignee details
        response = client.table('tasks').select(
            '*, assignee:assigned_to(id, email, first_name, last_name)'
        ).eq('project_id', project_id).execute()
        
        return response.data

    @classmethod
    def create_task(cls, project_id: int, data: dict, user_id: str):
        """Create a new task"""
        client = cls.get_client()
        
        # Get project to check if user is creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR members to create tasks
        is_creator = project.data[0]['created_by'] == user_id
        
        if not is_creator:
            # Verify user is a member
            member_check = client.table('project_members').select('*').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data:
                return None
        
        task_data = {
            'project_id': project_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'status': data.get('status', 'todo'),
            'assigned_to': data.get('assigned_to'),
            'due_date': data.get('due_date'),
            'priority': data.get('priority', 'medium'),
            'created_by': user_id
        }
        
        response = client.table('tasks').insert(task_data).execute()
        
        return response.data[0] if response.data else None

    @classmethod
    def update_task(cls, task_id: int, data: dict, user_id: str):
        """Update task"""
        client = cls.get_client()
        
        # Get task to verify project membership
        task = client.table('tasks').select('project_id, created_by').eq('id', task_id).execute()
        
        if not task.data:
            return None
        
        project_id = task.data[0]['project_id']
        
        # Get project to check if user is creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR members to update tasks
        is_creator = project.data[0]['created_by'] == user_id
        
        if not is_creator:
            # Verify user is a member of the project
            member_check = client.table('project_members').select('*').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data:
                return None
        
        # Update task
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'status' in data:
            update_data['status'] = data['status']
        if 'assigned_to' in data:
            update_data['assigned_to'] = data['assigned_to']
        if 'due_date' in data:
            update_data['due_date'] = data['due_date']
        if 'priority' in data:
            update_data['priority'] = data['priority']
        
        response = client.table('tasks').update(update_data).eq('id', task_id).execute()
        
        return response.data[0] if response.data else None
    
    @classmethod
    def delete_task(cls, task_id: int, user_id: str):
        """Delete task"""
        client = cls.get_client()
        
        # Get task to verify project membership
        task = client.table('tasks').select('project_id').eq('id', task_id).execute()
        
        if not task.data:
            return False
        
        project_id = task.data[0]['project_id']
        
        # Get project to check if user is creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return False
        
        # Allow creator OR members to delete tasks
        is_creator = project.data[0]['created_by'] == user_id
        
        if not is_creator:
            # Verify user is a member
            member_check = client.table('project_members').select('*').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data:
                return False
        
        client.table('tasks').delete().eq('id', task_id).execute()
        
        return True
    
    @classmethod
    def get_user_tasks(cls, user_id: str):
        """Get all tasks assigned to user"""
        client = cls.get_client()
        
        response = client.table('tasks').select('*, projects(name)').eq(
            'assigned_to', user_id
        ).execute()
        
        return response.data
    
    # Project Members
    @classmethod
    def get_project_members(cls, project_id: int, user_id: str):
        """Get all members of a project"""
        client = cls.get_client()
        
        # Get project to check creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR members
        if project.data[0]['created_by'] != user_id:
            # Check if member
            member_check = client.table('project_members').select('*').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data:
                return None
        
        # Get members with user details
        response = client.table('project_members').select(
            '*, users(id, email, first_name, last_name)'
        ).eq('project_id', project_id).execute()
        
        return response.data

    @classmethod
    def add_project_member(cls, project_id: int, member_user_id: str, role: str, user_id: str):
        """Add member to project"""
        client = cls.get_client()
        
        # Get project to check creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR admin members
        if project.data[0]['created_by'] == user_id:
            member_data = {
                'project_id': project_id,
                'user_id': member_user_id,
                'role': role
            }
            
            response = client.table('project_members').insert(member_data).execute()
            return response.data[0] if response.data else None
        
        # Check if member is admin
        member = client.table('project_members').select('role').eq(
            'project_id', project_id
        ).eq('user_id', user_id).execute()
        
        if member.data and member.data[0]['role'] in ['owner', 'admin']:
            member_data = {
                'project_id': project_id,
                'user_id': member_user_id,
                'role': role
            }
            
            response = client.table('project_members').insert(member_data).execute()
            return response.data[0] if response.data else None
        
        return None

    @classmethod
    def add_project_member_by_details(cls, project_id: int, name: str, email: str, role: str, current_user_id: str):
        """Add member to project by name and email (no auth user required)"""
        try:
            client = cls.get_client()
            
            # Get project to check creator
            project = client.table('projects').select('created_by').eq('id', project_id).execute()
            
            if not project.data:
                return None
            
            # Allow creator OR admin members
            is_creator = project.data[0]['created_by'] == current_user_id
            
            if not is_creator:
                # Check if member is admin
                member = client.table('project_members').select('role').eq(
                    'project_id', project_id
                ).eq('user_id', current_user_id).execute()
                
                if not member.data or member.data[0]['role'] not in ['owner', 'admin']:
                    return None
            
            # Generate a unique ID for non-auth member (or use email as ID)
            import uuid
            member_id = str(uuid.uuid4())
            
            # Add member
            member_data = {
                'project_id': project_id,
                'user_id': member_id,  # Temporary ID
                'role': role,
                'user': {
                    'email': email,
                    'name': name
                }
            }
            
            response = client.table('project_members').insert({
                'project_id': project_id,
                'user_id': member_id,
                'role': role
            }).execute()
            
            if response.data:
                # Store user details separately if needed
                # For now, return with the provided details
                return {
                    **response.data[0],
                    'user': {
                        'email': email,
                        'name': name
                    }
                }
            
            return None
            
        except Exception as e:
            print(f"Error adding member: {str(e)}")
            raise

    
    @classmethod
    def update_project_member(cls, project_id: int, member_user_id: str, role: str, current_user_id: str):
        """Update member role"""
        try:
            client = cls.get_client()
            
            # Check if current user is owner/admin
            current_member = client.table('project_members')\
                .select('role')\
                .eq('project_id', project_id)\
                .eq('user_id', current_user_id)\
                .single()\
                .execute()
            
            if not current_member.data or current_member.data['role'] not in ['owner', 'admin']:
                return None
            
            # Update member role
            response = client.table('project_members')\
                .update({'role': role})\
                .eq('project_id', project_id)\
                .eq('user_id', member_user_id)\
                .execute()
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error updating member: {str(e)}")
            raise
    
    @classmethod
    def remove_project_member(cls, project_id: int, member_user_id: str, user_id: str):
        """Remove member from project"""
        client = cls.get_client()
        
        # Verify user is owner or admin
        member = client.table('project_members').select('role').eq(
            'project_id', project_id
        ).eq('user_id', user_id).execute()
        
        if not member.data or member.data[0]['role'] not in ['owner', 'admin']:
            return False
        
        client.table('project_members').delete().eq(
            'project_id', project_id
        ).eq('user_id', member_user_id).execute()
        
        return True
    
    # Files
    @classmethod
    def upload_file(cls, project_id: int, file_data: dict, user_id: str):
        """Record file upload in database"""
        client = cls.get_client()
        
        # Get project to check if user is creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR members to upload
        is_creator = project.data[0]['created_by'] == user_id
        
        if not is_creator:
            # Verify user is a member
            member_check = client.table('project_members').select('*').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data:
                return None
        
        file_record = {
            'project_id': project_id,
            'filename': file_data['filename'],
            'file_path': file_data['file_path'],
            'file_size': file_data['file_size'],
            'file_type': file_data.get('file_type', 'application/octet-stream'),
            'uploaded_by': user_id
        }
        
        response = client.table('files').insert(file_record).execute()
        
        return response.data[0] if response.data else None

    @classmethod
    def get_project_files(cls, project_id: int, user_id: str):
        """Get all files for a project"""
        client = cls.get_client()
        
        # Get project to check if user is creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator OR members to view files
        is_creator = project.data[0]['created_by'] == user_id
        
        if not is_creator:
            # Verify user is a member
            member_check = client.table('project_members').select('*').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data:
                return None
        
        response = client.table('files').select(
            '*, uploader:uploaded_by(id, email, first_name, last_name)'
        ).eq('project_id', project_id).order('uploaded_at', desc=True).execute()
        
        return response.data

    @classmethod
    def delete_file(cls, file_id: int, user_id: str):
        """Delete file record"""
        client = cls.get_client()
        
        # Get file to verify project membership
        file_record = client.table('files').select('project_id, file_path, uploaded_by').eq(
            'id', file_id
        ).execute()
        
        if not file_record.data:
            return None
        
        project_id = file_record.data[0]['project_id']
        
        # Get project to check if user is creator
        project = client.table('projects').select('created_by').eq('id', project_id).execute()
        
        if not project.data:
            return None
        
        # Allow creator, uploader, or admin members to delete
        is_creator = project.data[0]['created_by'] == user_id
        is_uploader = file_record.data[0]['uploaded_by'] == user_id
        
        if not is_creator and not is_uploader:
            # Check if member is admin
            member_check = client.table('project_members').select('role').eq(
                'project_id', project_id
            ).eq('user_id', user_id).execute()
            
            if not member_check.data or member_check.data[0]['role'] not in ['owner', 'admin']:
                return None
        
        client.table('files').delete().eq('id', file_id).execute()
        
        return file_record.data[0]['file_path']

    #Guest/Non-auth Members
    @classmethod
    def add_guest_member(cls, project_id: int, name: str, email: str, role: str, current_user_id: str):
        """Add guest member to project (no auth user required)"""
        try:
            client = cls.get_client()
            
            # Check if current user is creator or admin
            project = client.table('projects').select('created_by').eq('id', project_id).execute()
            
            if not project.data:
                return None
            
            is_creator = project.data[0]['created_by'] == current_user_id
            
            if not is_creator:
                member = client.table('project_members').select('role').eq(
                    'project_id', project_id
                ).eq('user_id', current_user_id).execute()
                
                if not member.data or member.data[0]['role'] not in ['owner', 'admin']:
                    return None
            
            # Add guest member
            guest_data = {
                'project_id': project_id,
                'name': name,
                'email': email.lower(),
                'role': role
            }
            
            response = client.table('guest_members').insert(guest_data).execute()
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error adding guest member: {str(e)}")
            raise

    @classmethod
    def get_all_project_members(cls, project_id: int, user_id: str):
        """Get both auth users and guest members"""
        try:
            client = cls.get_client()
            
            # Check permissions
            project = client.table('projects').select('created_by').eq('id', project_id).execute()
            if not project.data:
                return None
            
            is_creator = project.data[0]['created_by'] == user_id
            
            if not is_creator:
                member_check = client.table('project_members').select('*').eq(
                    'project_id', project_id
                ).eq('user_id', user_id).execute()
                
                if not member_check.data:
                    return None
            
            # Get auth user members
            auth_members = client.table('project_members').select(
                '*, users(id, email, first_name, last_name)'
            ).eq('project_id', project_id).execute()
            
            # Get guest members
            guest_members = client.table('guest_members').select('*').eq(
                'project_id', project_id
            ).execute()
            
            # Combine and format
            all_members = []
            
            # Add auth users
            if auth_members.data:
                for member in auth_members.data:
                    all_members.append({
                        'id': member['id'],
                        'user_id': member['user_id'],
                        'role': member['role'],
                        'type': 'auth',
                        'user': member.get('users', {})
                    })
            
            # Add guest members
            if guest_members.data:
                for guest in guest_members.data:
                    all_members.append({
                        'id': guest['id'],
                        'user_id': f"guest_{guest['id']}",  # Fake ID for frontend
                        'role': guest['role'],
                        'type': 'guest',
                        'user': {
                            'email': guest['email'],
                            'name': guest['name']
                        }
                    })
            
            return all_members
            
        except Exception as e:
            print(f"Error getting members: {str(e)}")
            raise

    @classmethod
    def remove_guest_member(cls, project_id: int, member_id: int, current_user_id: str):
        """Remove guest member"""
        try:
            client = cls.get_client()
            
            # Check permissions
            project = client.table('projects').select('created_by').eq('id', project_id).execute()
            if not project.data:
                return False
            
            is_creator = project.data[0]['created_by'] == current_user_id
            
            if not is_creator:
                member = client.table('project_members').select('role').eq(
                    'project_id', project_id
                ).eq('user_id', current_user_id).execute()
                
                if not member.data or member.data[0]['role'] not in ['owner', 'admin']:
                    return False
            
            # Delete guest member
            client.table('guest_members').delete().eq('id', member_id).execute()
            return True
            
        except Exception as e:
            print(f"Error removing guest member: {str(e)}")
            return False

    @classmethod
    def update_guest_member(cls, project_id: int, member_id: int, role: str, current_user_id: str):
        """Update guest member role"""
        try:
            client = cls.get_client()
            
            # Check permissions
            project = client.table('projects').select('created_by').eq('id', project_id).execute()
            if not project.data:
                return None
            
            is_creator = project.data[0]['created_by'] == current_user_id
            
            if not is_creator:
                member = client.table('project_members').select('role').eq(
                    'project_id', project_id
                ).eq('user_id', current_user_id).execute()
                
                if not member.data or member.data[0]['role'] not in ['owner', 'admin']:
                    return None
            
            # Update role
            response = client.table('guest_members').update({
                'role': role
            }).eq('id', member_id).execute()
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            print(f"Error updating guest member: {str(e)}")
            raise

