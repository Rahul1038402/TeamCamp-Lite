"""
Flask Application Entry Point
"""
import os
from app import create_app

# Get environment
env = os.getenv('FLASK_ENV', 'development')

# Create app
app = create_app(env)

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.getenv('PORT', 5000))
    
    # Run application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )