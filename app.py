import os
import logging
from werkzeug.utils import secure_filename
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify, send_from_directory

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "a-very-secure-secret-key")

# Configure Gemini API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def initialize_gemini():
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not found in environment variables")
        return None
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        return model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {str(e)}")
        return None

model = initialize_gemini()
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files[]' not in request.files:
        return jsonify({'error': 'No files provided'}), 400

    files = request.files.getlist('files[]')
    responses = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Process file content with Gemini
            try:
                with open(filepath, 'rb') as f:
                    response = model.generate_content(["Analyze this file:", f])
                    responses.append(response.text)
            except Exception as e:
                responses.append(f"Error processing {filename}: {str(e)}")

    return jsonify({'responses': responses})

@app.route('/generate-image', methods=['POST'])
def generate_image():
    message = request.json.get('message', '').replace('/imagine', '').strip()
    try:
        # Use Gemini to generate image
        image_model = genai.GenerativeModel('gemini-pro-vision')
        response = image_model.generate_content(message)
        # Note: This is a placeholder. You'll need to implement actual image generation
        return jsonify({'image_url': 'Generated image URL would go here'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        if not model:
            logger.error("Gemini model not initialized")
            return jsonify({
                'error': 'AI service is not available. Please check your API key.',
                'status': 'error'
            }), 503

        message = request.json.get('message', '').strip()
        deep_thinking = request.json.get('deepThinking', False)

        if not message:
            return jsonify({
                'error': 'Message is required',
                'status': 'error'
            }), 400

        # Generate response using Gemini
        logger.debug(f"Sending message to Gemini: {message}")

        if deep_thinking:
            # Add context and request more detailed response for deep thinking mode
            enhanced_prompt = f"""Please provide a comprehensive and detailed analysis of the following query, 
            considering multiple perspectives and including relevant examples or references when applicable: 

            {message}"""
            gemini_response = model.generate_content(enhanced_prompt)
        else:
            gemini_response = model.generate_content(message)

        if not gemini_response or not gemini_response.text:
            return jsonify({
                'error': 'Failed to get response from AI',
                'status': 'error'
            }), 500

        response_text = gemini_response.text.strip()
        logger.debug(f"Received response from Gemini: {response_text}")

        return jsonify({
            'response': response_text,
            'status': 'success'
        })

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'error': 'Something went wrong. Please try again.',
            'status': 'error'
        }), 500