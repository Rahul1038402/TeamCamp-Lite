"""
Flask Application Factory
"""
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import config, Config


def create_app(config_name='development'):
    """Create and configure Flask application"""
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Validate configuration
    Config.validate()
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": Config.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.projects import projects_bp
    from app.routes.tasks import tasks_bp
    from app.routes.members import members_bp
    from app.routes.files import files_bp
    
    app.register_blueprint(auth_bp, url_prefix=f"{Config.API_PREFIX}/auth")
    app.register_blueprint(projects_bp, url_prefix=f"{Config.API_PREFIX}/projects")
    app.register_blueprint(tasks_bp, url_prefix=f"{Config.API_PREFIX}")
    app.register_blueprint(members_bp, url_prefix=f"{Config.API_PREFIX}")
    app.register_blueprint(files_bp, url_prefix=f"{Config.API_PREFIX}")
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'}), 200
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'TeamCamp Lite API',
            'version': '1.0.0',
            'endpoints': {
                'auth': f"{Config.API_PREFIX}/auth",
                'projects': f"{Config.API_PREFIX}/projects",
                'tasks': f"{Config.API_PREFIX}/tasks",
                'members': f"{Config.API_PREFIX}/members",
                'files': f"{Config.API_PREFIX}/files"
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app