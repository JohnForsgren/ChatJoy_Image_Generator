document.addEventListener('DOMContentLoaded', function() {
    let referenceCount = 2; // Start with 2 reference widgets
    
    // DOM Elements
    const addReferenceBtn = document.getElementById('add-reference-btn');
    const generateBtn = document.getElementById('generate-btn');
    const mainDescription = document.getElementById('main-description');
    const generatedImageContainer = document.getElementById('generated-image-container');
    const keywordsContainer = document.getElementById('keywords-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const variationsBtn = document.getElementById('variations-btn');
    const warningModal = document.getElementById('warning-modal');
    const warningMessage = document.getElementById('warning-message');
    const closeModalBtn = document.querySelector('.close');
    const continueAnywayBtn = document.getElementById('continue-anyway');
    const addImageBtn = document.getElementById('add-image');
    
    // Setup image preview for initial reference widgets
    setupImagePreview('reference-image-1', 'image-preview-1');
    setupImagePreview('reference-image-2', 'image-preview-2');
    
    // Add more reference widgets
    addReferenceBtn.addEventListener('click', function() {
        referenceCount++;
        addReferenceWidget(referenceCount);
    });
    
    // Generate image
    generateBtn.addEventListener('click', function() {
        if (mainDescription.value.trim() === '') {
            alert('Please enter a main description for the image.');
            return;
        }
        
        const hasReferences = checkForReferences();
        if (!hasReferences) {
            showWarningModal();
            return;
        }
        
        generateImage();
    });
    
    // Setup modal buttons
    closeModalBtn.addEventListener('click', function() {
        warningModal.style.display = 'none';
    });
    
    continueAnywayBtn.addEventListener('click', function() {
        warningModal.style.display = 'none';
        generateImage();
    });
    
    addImageBtn.addEventListener('click', function() {
        warningModal.style.display = 'none';
        document.getElementById('reference-image-1').click();
    });
    
    // Get variations
    variationsBtn.addEventListener('click', function() {
        alert('This feature would generate creative variations in a full implementation.');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === warningModal) {
            warningModal.style.display = 'none';
        }
    });
    
    // FUNCTIONS
    
    // Add a new reference widget
    function addReferenceWidget(index) {
        const container = document.getElementById('reference-widgets-container');
        
        const widget = document.createElement('div');
        widget.className = 'reference-widget';
        widget.id = `reference-widget-${index}`;
        
        widget.innerHTML = `
            <h3>Reference image ${index} + description:</h3>
            <div class="input-group">
                <input type="file" id="reference-image-${index}" class="reference-image-input" accept="image/*">
                <div class="image-preview" id="image-preview-${index}"></div>
            </div>
            <textarea id="reference-description-${index}" class="reference-description" placeholder="Describe this reference image..."></textarea>
        `;
        
        container.appendChild(widget);
        setupImagePreview(`reference-image-${index}`, `image-preview-${index}`);
    }
    
    // Set up image preview functionality
    function setupImagePreview(inputId, previewId) {
        const inputElement = document.getElementById(inputId);
        const previewElement = document.getElementById(previewId);
        
        inputElement.addEventListener('change', function(event) {
            if (event.target.files && event.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                
                reader.readAsDataURL(event.target.files[0]);
            } else {
                previewElement.innerHTML = '';
            }
        });
    }
    
    // Check if any reference images were uploaded
    function checkForReferences() {
        for (let i = 1; i <= referenceCount; i++) {
            const inputElement = document.getElementById(`reference-image-${i}`);
            if (inputElement.files && inputElement.files[0]) {
                return true;
            }
        }
        return false;
    }
    
    // Show warning modal
    function showWarningModal() {
        warningMessage.textContent = 'No reference images uploaded. It is recommended to upload at least one reference image for better results. Would you like to continue anyway?';
        warningModal.style.display = 'block';
    }
    
    // Generate image
    function generateImage() {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        generatedImageContainer.innerHTML = '';
        keywordsContainer.innerHTML = '';
        
        // Create form data
        const formData = new FormData();
        formData.append('main_description', mainDescription.value);
        
        // Append reference images and descriptions
        for (let i = 1; i <= referenceCount; i++) {
            const imageInput = document.getElementById(`reference-image-${i}`);
            const descriptionInput = document.getElementById(`reference-description-${i}`);
            
            if (imageInput.files && imageInput.files[0]) {
                formData.append(`reference_image_${i}`, imageInput.files[0]);
                formData.append(`reference_description_${i}`, descriptionInput.value);
            }
        }
        
        // Send to API
        fetch('/generate', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            // Display the generated image
            generatedImageContainer.innerHTML = `<img src="${data.image}" alt="Generated image">`;
            
            // Display keywords
            if (data.keywords) {
                keywordsContainer.innerHTML = '<h3>Generated Keywords:</h3>';
                
                for (const [category, items] of Object.entries(data.keywords)) {
                    if (items && items.length > 0) {
                        const categoryEl = document.createElement('div');
                        categoryEl.className = 'keyword-category';
                        
                        const title = document.createElement('h4');
                        title.textContent = category;
                        categoryEl.appendChild(title);
                        
                        const list = document.createElement('div');
                        list.className = 'keyword-list';
                        
                        items.forEach(item => {
                            const keyword = document.createElement('span');
                            keyword.className = 'keyword';
                            keyword.textContent = item;
                            list.appendChild(keyword);
                        });
                        
                        categoryEl.appendChild(list);
                        keywordsContainer.appendChild(categoryEl);
                    }
                }
            }
            
            // Enable variations button
            variationsBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            loadingIndicator.style.display = 'none';
            generatedImageContainer.innerHTML = '<p style="color: red;">Error generating image. Please try again.</p>';
        });
    }
});