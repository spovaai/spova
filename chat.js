document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const navToggle = document.getElementById('nav-toggle');
    const closeNav = document.getElementById('close-nav');
    const sidenav = document.getElementById('sidenav');
    const themeToggle = document.getElementById('theme-toggle');
    const clearHistory = document.getElementById('clear-history');
    const html = document.documentElement;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-bs-theme', currentTheme);
    themeToggle.checked = currentTheme === 'dark';

    // Configure marked.js
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    // Theme toggle
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        html.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Navigation toggle
    function toggleNav() {
        sidenav.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    navToggle.addEventListener('click', toggleNav);
    closeNav.addEventListener('click', toggleNav);
    overlay.addEventListener('click', toggleNav);

    // Clear chat history
    clearHistory.addEventListener('click', () => {
        chatMessages.innerHTML = `
            <div class="message bot">
                <div class="message-content">
                    Hello! I'm an AI assistant. How can I help you today? 💡
                </div>
            </div>
        `;
        toggleNav();
    });

    const deepThinkingToggle = document.getElementById('deep-thinking-toggle');
    let isDeepThinkingEnabled = localStorage.getItem('deepThinking') === 'true';

    deepThinkingToggle.classList.toggle('active', isDeepThinkingEnabled);

    deepThinkingToggle.addEventListener('click', () => {
        isDeepThinkingEnabled = !isDeepThinkingEnabled;
        deepThinkingToggle.classList.toggle('active', isDeepThinkingEnabled);
        localStorage.setItem('deepThinking', isDeepThinkingEnabled);
    });

    function formatMessage(content) {
        if (content instanceof File) {
            return `📎 ${content.name} (${(content.size / 1024).toFixed(2)} KB)`;
        } else if (content.startsWith('data:image')) {
            return `<img src="${content}" alt="Generated Image" style="max-width:100%;border-radius:0.5rem;">`;
        } else {
            // Process numbered lists to add line breaks
            content = content.replace(/(\d+\.\s)/g, '\n$1');
            
            // Custom renderer for code blocks
            const renderer = new marked.Renderer();
            renderer.code = function(code, language) {
                return `
                    <div class="code-block">
                        <div class="code-header">
                            <span class="code-language">${language || 'code'}</span>
                            <button class="copy-btn" onclick="copyCode(this)">
                                <i class="bi bi-clipboard"></i>
                            </button>
                        </div>
                        <pre><code>${code}</code></pre>
                    </div>`;
            };
            
            marked.setOptions({ renderer });
            return marked.parse(content);
        }
    }

    function copyCode(button) {
        const codeBlock = button.closest('.code-block').querySelector('code');
        const text = codeBlock.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            const icon = button.querySelector('i');
            icon.classList.remove('bi-clipboard');
            icon.classList.add('bi-clipboard-check');
            
            setTimeout(() => {
                icon.classList.remove('bi-clipboard-check');
                icon.classList.add('bi-clipboard');
            }, 2000);
        });
    }

    function addMessage(content, isUser = false, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.style.animation = 'slideIn 0.3s ease';

        const messageContent = document.createElement('div');
        messageContent.className = `message-content ${isError ? 'error' : ''}`;
        messageContent.innerHTML = formatMessage(content);

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        typingIndicator.classList.remove('d-none');
        const deepThinkingIndicator = typingIndicator.querySelector('.deep-thinking');
        if (isDeepThinkingEnabled) {
            deepThinkingIndicator.classList.remove('d-none');
        } else {
            deepThinkingIndicator.classList.add('d-none');
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('d-none');
    }

    function handleError(error) {
        hideTypingIndicator();
        const errorMessage = error.response?.error || error.message || 'Sorry, an error occurred. Please try again.';
        addMessage(errorMessage, false, true);
        console.error('Error:', error);
    }

    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files || []);
        files.forEach(file => addMessage(file, true));

        const formData = new FormData();
        files.forEach(file => formData.append('files[]', file));

        showTypingIndicator();

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            hideTypingIndicator();
            data.responses.forEach(response => addMessage(response));
        })
        .catch(handleError);

        fileInput.value = '';
    });

    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const message = messageInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        messageInput.value = '';
        showTypingIndicator();

        try {
            const isImagePrompt = message.toLowerCase().startsWith('/imagine');
            const endpoint = isImagePrompt ? '/generate-image' : '/chat';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: message,
                    deepThinking: isDeepThinkingEnabled
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw { response: data, status: response.status };
            }

            hideTypingIndicator();
            if (isImagePrompt) {
                addMessage(data.image_url, false);
            } else {
                addMessage(data.response, false);
            }

        } catch (error) {
            handleError(error);
        }
    });
});