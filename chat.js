class ChatInterface {
    constructor() {
        this.apiKey = 'AIzaSyC2WIamM5a3OdUUcdLp2ATmUZEmMqBhS5c';
        this.API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;

        this.elements = {
            chatForm: document.getElementById('chatForm'),
            userInput: document.getElementById('userInput'),
            chatMessages: document.getElementById('chatMessages'),
            deepThinkButton: document.getElementById('deepThinkButton'),
            fileInput: document.getElementById('fileInput'),
            navToggle: document.getElementById('nav-toggle'),
            navMenu: document.getElementById('nav-menu')
        };

        this.isDeepThinking = false;
        this.initialize();
        this.setupExamplePrompts();
        this.setupNavigation();
    }

    setupNavigation() {
        const navToggle = this.elements.navToggle;
        const navMenu = this.elements.navMenu;
        const settingsToggle = document.querySelector('.settings-toggle');
        const settingsSubmenu = document.getElementById('settings-submenu');

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('show');

            // Add animation classes
            if (navMenu.classList.contains('show')) {
                navToggle.style.transform = 'rotate(90deg)';
            } else {
                navToggle.style.transform = 'rotate(0deg)';
            }
        });

        // Settings submenu toggle
        if (settingsToggle) {
            settingsToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                settingsSubmenu.classList.toggle('show');
                const chevron = settingsToggle.querySelector('.fa-chevron-right');
                chevron.style.transform = settingsSubmenu.classList.contains('show') ? 'rotate(90deg)' : 'rotate(0deg)';
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.closest('.refresh-messages')) {
                e.preventDefault();
                this.elements.chatMessages.innerHTML = '';
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
                localStorage.removeItem('chatHistory');
                return;
            }
            
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('show');
                if (settingsSubmenu) {
                    settingsSubmenu.classList.remove('show');
                    const chevron = settingsToggle.querySelector('.fa-chevron-right');
                    chevron.style.transform = 'rotate(0deg)';
                }
                navToggle.style.transform = 'rotate(0deg)';
            }
        });

        // Handle touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('show');
                if (settingsSubmenu) {
                    settingsSubmenu.classList.remove('show');
                    const chevron = settingsToggle.querySelector('.fa-chevron-right');
                    chevron.style.transform = 'rotate(0deg)';
                }
                navToggle.style.transform = 'rotate(0deg)';
            }
        });

        // Add transitions
        navToggle.style.transition = 'transform 0.3s ease';
        if (settingsToggle) {
            const chevron = settingsToggle.querySelector('.fa-chevron-right');
            chevron.style.transition = 'transform 0.3s ease';
        }
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

        // Load chat history from localStorage
        const savedMessages = localStorage.getItem('chatHistory');
        if (savedMessages) {
            this.elements.chatMessages.innerHTML = savedMessages;
        } else if (!this.elements.chatMessages.querySelector('.message')) {
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

        this.elements.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.elements.deepThinkButton.addEventListener('click', () => this.toggleDeepThinking());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    toggleDeepThinking() {
        this.isDeepThinking = !this.isDeepThinking;
        this.elements.deepThinkButton.classList.toggle('active');
        this.elements.deepThinkButton.innerHTML = this.isDeepThinking ?
            '<i class="fa fa-book"></i> Deep' :
            '<i class="fa fa-book"></i>';
    }

    async handleSubmit(e) {
        e.preventDefault();
        const userInput = this.elements.userInput.value.trim();
        if (!userInput) return;

        this.addMessage(userInput, 'user');
        this.elements.userInput.value = '';
        const startTime = Date.now();
        this.showTypingIndicator(this.isDeepThinking);

        try {
            // Add deep thinking delay if enabled
            if (this.isDeepThinking) {
                await new Promise(resolve => setTimeout(resolve, 3000));
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

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to get response from AI');
            }

            const botResponse = data.candidates[0].content.parts[0].text;

            this.removeTypingIndicator();
            this.addMessage(botResponse, 'ai', startTime);
        } catch (error) {
            console.error('API error:', error);
            this.removeTypingIndicator();
            this.showError("Failed to get response: " + error.message);
        }
    }

    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            this.addMessage(`Uploading file: ${file.name}`, 'user');
            this.showTypingIndicator();

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload file');
            }

            this.removeTypingIndicator();
            this.addMessage(`File uploaded successfully: ${file.name}. You can now ask questions about its contents.`, 'ai');

            // Reset file input
            this.elements.fileInput.value = '';
        } catch (error) {
            console.error('File upload error:', error);
            this.removeTypingIndicator();
            this.showError("Failed to upload file: " + error.message);
        }
    }


        if (sender === 'ai') {
            const avatar = document.createElement('div');
            avatar.className = 'bot-avatar';
            messageDiv.appendChild(avatar);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (window.marked && sender === 'ai') {
            const parsed = marked.parse(content);
            contentDiv.innerHTML = parsed.replace(/<pre><code class="language-(\w+)">([\s\S]+?)<\/code><\/pre>/g, 
                (_, lang, code) => {
                    const lines = code.split('\n').map(line => `<span>${line}</span>`).join('\n');
                    return `
                        <pre>
                            <div class="code-header">${lang}</div>
                            <button class="copy-btn" onclick="event.stopPropagation()">Copy</button>
                            <code class="language-${lang}">${lines}</code>
                        </pre>`;
                }
            );

            // Add copy button for code blocks
            contentDiv.querySelectorAll('pre').forEach(pre => {
                const copyBtn = pre.querySelector('.copy-btn');
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const code = pre.querySelector('code').textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        copyBtn.textContent = 'Copied!';
                        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
                    }).catch(err => console.error('Failed to copy:', err));
                });
            });
        } else {
            contentDiv.textContent = content;
        }

    addMessage(content, sender, startTime = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;

        if (sender === 'ai' && startTime && this.isDeepThinking) {
            const processingTime = document.createElement('div');
            processingTime.className = 'processing-time';
            processingTime.textContent = `Processing time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`;
            messageDiv.appendChild(processingTime);
        }

        // Add copy button for entire message
        if (sender === 'ai') {
            const copyMessageBtn = document.createElement('button');
            copyMessageBtn.className = 'message-copy-btn';
            copyMessageBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyMessageBtn.title = 'Copy message';
            
            // Get the actual text content without HTML tags for copying
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const textContent = tempDiv.textContent;

            copyMessageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(textContent).then(() => {
                    copyMessageBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyMessageBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                }).catch(err => console.error('Failed to copy:', err));
            });
            messageDiv.appendChild(copyMessageBtn);
        }

        messageDiv.appendChild(contentDiv);
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        localStorage.setItem('chatHistory', this.elements.chatMessages.innerHTML);
    }

    showTypingIndicator(isDeepThinking = false) {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator message-ai';
        indicator.innerHTML = `
            <div class="bot-avatar"></div>
            <div class="message-content">
                ${isDeepThinking ? '<div class="deep-thinking">Deep Thinking...</div>' : ` `}
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

document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
});
