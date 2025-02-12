from flask import render_template, request, jsonify, redirect, url_for
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import app, db
from models import StoredKnowledge, UploadedFile, User # Assuming User model exists
from auth import auth
import logging
import os
import uuid

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Register blueprints

def insert_example_knowledge():
    example_sentences = [
        "Flask is a lightweight WSGI web application framework in Python.",
        "Python is a high-level, general-purpose programming language.",
        "Web development involves both frontend and backend programming.",
        "Databases are organized collections of structured information.",
        "Authentication is the process of verifying a user's identity."
    ]

    with app.app_context():
        for sentence in example_sentences:
            knowledge = StoredKnowledge(
                content=sentence,
                source_file='example_data'
            )
            db.session.add(knowledge)
        db.session.commit()

app.register_blueprint(auth)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

            file.save(filepath)

            uploaded_file = UploadedFile(
                filename=filename,
                filepath=filepath,
                content_type=file.content_type
            )
            db.session.add(uploaded_file)

            if file.content_type == 'text/plain':
                with open(filepath, 'r') as f:
                    content = f.read()
                    knowledge = StoredKnowledge(
                        content=content,
                        source_file=filename
                    )
                    db.session.add(knowledge)

            db.session.commit()
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename
            })

        except Exception as e:
            db.session.rollback()
            logging.error(f"Error uploading file: {str(e)}")
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/query_knowledge', methods=['POST'])
@login_required
def query_knowledge():
    query = request.json.get('query', '')
    knowledge = StoredKnowledge.query.filter(
        StoredKnowledge.content.ilike(f'%{query}%')
    ).order_by(StoredKnowledge.created_at.desc()).first()

    if knowledge:
        return jsonify({
            'found': True,
            'content': knowledge.content,
            'source': knowledge.source_file
        })
    return jsonify({'found': False})

def create_admin_accounts():
    admin_accounts = [
        {'email': 'raffael@admin.com', 'password': 'ilovetosha', 'username': 'raffael'},
        {'email': 'admin2@admin.com', 'password': 'admin456', 'username': 'admin2'},
        {'email': 'admin3@admin.com', 'password': 'admin789', 'username': 'admin3'}
    ]
    
    for account in admin_accounts:
        try:
            user = User(email=account['email'], username=account['username'])
            user.set_password(account['password'])
            db.session.add(user)
            db.session.commit()
            logging.info(f"Admin account {account['email']} created successfully.")
        except Exception as e:
            logging.error(f"Error creating admin account: {e}")
            db.session.rollback()


if __name__ == '__main__':
    with app.app_context():
        create_admin_accounts()
    app.run(host='0.0.0.0', port=5000, debug=True)