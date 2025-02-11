class ChatInterface {
    constructor() {
        this.apiKey = 'AIzaSyC2WIamM5a3OdUUcdLp2ATmUZEmMqBhS5c';
        this.API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;

        this.elements = {
            chatForm: document.getElementById('chatForm'),
            userInput: document.getElementById('userInput'),
            chatMessages: document.getElementById('chatMessages'),
            fileInput: document.getElementById('fileInput'),
            deepThinkButton: document.getElementById('deepThinkButton')
        };

        this.isDeepThinking = false;
        this.initialize();
        this.setupExamplePrompts();
    }

    setupExamplePrompts() {
        document.querySelectorAll('.welcome-message li').forEach(li => {
            li.addEventListener('click', () => {
                const promptText = li.textContent.replace(/^"(.+)"$/, '$1');
                this.elements.userInput.value = promptText;
                this.elements.userInput.focus();
            });
        });
    }

    initialize() {
        this.elements.userInput.disabled = false;
        this.elements.userInput.placeholder = "Type your message...";
        this.elements.chatForm.querySelector('button[type="submit"]').disabled = false;

        // Keep welcome message visible
        if (!this.elements.chatMessages.querySelector('.message')) {
            this.elements.chatMessages.innerHTML = `
                <div class="welcome-message text-center p-4">
                    <h2>Welcome to spovaAI Chat</h2>
                    <p>Try these example prompts:</p>
                    <ul class="list-unstyled">
                        <li>"Tell me about artificial intelligence"</li>
                        <li>"How does photosynthesis work?"</li>
                        <li>"Write a short story about space exploration"</li>
                        <li>"Explain quantum computing in simple terms"</li>
                    </ul>
                    <p class="mt-3"><small>Use the deep thinking mode <i class="fa fa-book"></i> for more detailed responses</small></p>
                </div>`;
        }

        // Set up event listeners
        this.elements.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.deepThinkButton.addEventListener('click', () => this.toggleDeepThinking());

        // Load marked.js for markdown support
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        document.head.appendChild(script);
    }

    toggleDeepThinking() {
        this.isDeepThinking = !this.isDeepThinking;
        this.elements.deepThinkButton.classList.toggle('active');
        this.elements.deepThinkButton.innerHTML = this.isDeepThinking ? 
            '<i class="fa fa-book"></i>fakyu' : 
            '<i class="fa fa-book"></i>';
    }

    async handleSubmit(e) {
        e.preventDefault();
        const userInput = this.elements.userInput.value.trim();
        if (!userInput) return;

        // Add user message
        this.addMessage(userInput, 'user');
        this.elements.userInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Add deep thinking delay if enabled
            if (this.isDeepThinking) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: this.isDeepThinking ? 
                                `Please provide a detailed, comprehensive response with multiple perspectives and examples. Consider the following request carefully: ${userInput}` :
                                userInput,
                        }],
                    }],
                }),
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to get response from spovaAI API');
            }

            // Get bot response
            const botResponse = data.candidates[0].content.parts[0].text;

            // Remove typing indicator and add AI response
            this.removeTypingIndicator();
            this.addMessage(botResponse, 'ai');
        } catch (error) {
            console.error('spovi API error:', error);
            this.removeTypingIndicator();
            this.showError("Failed to get response from spovaAI. Error: " + error.message);
        }
    }

    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // For now, just append the filename to the input
            const filename = file.name;
            this.elements.userInput.value += `\nAttached file: ${filename}`;

            // Reset file input
            this.elements.fileInput.value = '';
        } catch (error) {
            console.error('File upload error:', error);
            this.showError("Failed to upload file: " + error.message);
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;

        if (sender === 'ai') {
            const avatar = document.createElement('div');
            avatar.className = 'bot-avatar';
            messageDiv.appendChild(avatar);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (window.marked && sender === 'ai') {
            const parsed = marked.parse(text);
            contentDiv.innerHTML = parsed.replace(/<pre><code class="language-(\w+)">([\s\S]+?)<\/code><\/pre>/g, 
                (_, lang, code) => {
                    const lines = code.split('\n').map(line => `<span>${line}</span>`).join('\n');
                    return `
                        <pre>
                            <div class="code-header">${lang}</div>
                            <button class="copy-btn">Copy</button>
                            <code class="language-${lang}">${lines}</code>
                        </pre>`;
                }
            );

            // Add copy button for code blocks
            contentDiv.querySelectorAll('pre').forEach(pre => {
                const copyBtn = pre.querySelector('.copy-btn');
                copyBtn.addEventListener('click', () => {
                    const code = pre.querySelector('code').textContent;
                    navigator.clipboard.writeText(code);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
                });
            });
        } else {
            contentDiv.textContent = text;
        }

        // Add copy button for entire message
        const copyMessageBtn = document.createElement('button');
        copyMessageBtn.className = 'message-copy-btn';
        copyMessageBtn.textContent = 'Copy';
        copyMessageBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text);
            copyMessageBtn.textContent = 'Copied!';
            setTimeout(() => copyMessageBtn.textContent = 'Copy', 2000);
        });
        messageDiv.appendChild(copyMessageBtn);

        messageDiv.appendChild(contentDiv);
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator message-ai';
        indicator.innerHTML = `
            <div class="bot-avatar"></div>
            <div class="message-content">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        this.elements.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = this.elements.chatMessages.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.elements.chatMessages.appendChild(errorDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
}

// Initialize chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
});

