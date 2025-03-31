from flask import Flask, render_template, request, jsonify
import os
import random
from PIL import Image, ImageDraw, ImageFont
import io
import base64

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_image():
    # Get form data
    main_description = request.form.get('main_description', '')
    
    # Get reference images and their descriptions
    reference_data = []
    for key, file in request.files.items():
        if key.startswith('reference_image_'):
            index = key.split('_')[-1]
            description = request.form.get(f'reference_description_{index}', '')
            if file and file.filename:
                reference_data.append({
                    'image_name': file.filename,
                    'description': description
                })
    
    # Generate keywords based on the main description (in a real app, this would call GPT)
    # This is just a mockup placeholder for the breakdown functionality
    keywords = mock_keyword_extraction(main_description)
    
    # For mockup: generate a random colored image with text
    img_width, img_height = 512, 512
    # Generate random RGB values
    r, g, b = random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)
    
    # Create image
    img = Image.new('RGB', (img_width, img_height), color=(r, g, b))
    draw = ImageDraw.Draw(img)
    
    # Add text to the image
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()
    
    # Add main description
    draw.text((20, 20), f"Main: {main_description}", fill=(255, 255, 255), font=font)
    
    # Add reference information
    y_position = 60
    for ref in reference_data:
        text = f"Ref: {ref['image_name']} - {ref['description']}"
        draw.text((20, y_position), text, fill=(255, 255, 255), font=font)
        y_position += 30
    
    # Add keywords
    y_position += 20
    draw.text((20, y_position), "Keywords:", fill=(255, 255, 255), font=font)
    y_position += 30
    for category, items in keywords.items():
        text = f"{category}: {', '.join(items)}"
        draw.text((30, y_position), text, fill=(255, 255, 255), font=font)
        y_position += 30
    
    # Convert to base64 for sending to frontend
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    return jsonify({
        'image': f'data:image/png;base64,{img_str}',
        'keywords': keywords
    })

def mock_keyword_extraction(description):
    """Mock function to simulate GPT breaking down the description into keywords"""
    # In a real app, this would call the GPT API
    
    # Basic example breakdown based on common terms
    keywords = {
        'Person': [],
        'Setting': [],
        'Objects': [],
        'Style': [],
        'Mood': []
    }
    
    # Very simple keyword extraction mockup
    description_lower = description.lower()
    
    if any(word in description_lower for word in ['person', 'man', 'woman', 'girl', 'boy', 'people']):
        keywords['Person'] = ['adult', 'casual clothes']
        
    if any(word in description_lower for word in ['happy', 'smile', 'joy', 'laugh']):
        keywords['Mood'] = ['happy', 'cheerful']
        keywords['Person'].append('smiling')
    elif any(word in description_lower for word in ['sad', 'unhappy', 'cry', 'tears']):
        keywords['Mood'] = ['sad', 'melancholic']
        keywords['Person'].append('frowning')
        
    if 'cafe' in description_lower or 'coffee' in description_lower:
        keywords['Setting'] = ['cafe', 'indoor']
        keywords['Objects'] = ['coffee cup', 'table', 'chair']
        
    if 'beach' in description_lower or 'ocean' in description_lower or 'sea' in description_lower:
        keywords['Setting'] = ['beach', 'outdoor']
        keywords['Objects'] = ['sand', 'ocean', 'umbrella']
    
    # Default case if no keywords are found
    if not any(keywords.values()):
        keywords['Style'] = ['photorealistic']
        keywords['Objects'] = ['suggested by main description']
        
    return keywords

if __name__ == '__main__':
    app.run(debug=True)