  document.addEventListener('DOMContentLoaded', function () {
      const chatForm = document.getElementById('chat-form');
      const messageInput = document.getElementById('message-input');
      const chatMessages = document.getElementById('chat-messages');
      const typingIndicator = document.getElementById('typing-indicator');

      // Gemini API Key
      const GEMINI_API_KEY = 'AIzaSyC2WIamM5a3OdUUcdLp2ATmUZEmMqBhS5c'; // Replace with your Gemini API key
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

      // Add a message to the chat
      function addMessage(content, isUser = false) {
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

          const messageContent = document.createElement('div');
          messageContent.className = 'message-content';
          messageContent.innerHTML = marked.parse(content); // Use marked.js to parse markdown

          messageDiv.appendChild(messageContent);
          chatMessages.appendChild(messageDiv);
          chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Show typing indicator
      function showTypingIndicator() {
          typingIndicator.classList.remove('d-none');
      }

      // Hide typing indicator
      function hideTypingIndicator() {
          typingIndicator.classList.add('d-none');
      }

      // Handle chat form submission
      chatForm.addEventListener('submit', async function (e) {
          e.preventDefault();

          const message = messageInput.value.trim();
          if (!message) return;

          // Add user message
          addMessage(message, true);
          messageInput.value = '';
          showTypingIndicator();

          try {
              // Send message to Gemini API
              const response = await fetch(GEMINI_API_URL, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      contents: [
                          {
                              parts: [
                                  {
                                      text: message,
                                  },
                              ],
                          },
                      ],
                  }),
              });

              const data = await response.json();

              if (!response.ok) {
                  throw new Error(data.error || 'Failed to fetch response from Gemini API');
              }

              // Add bot response
              const botResponse = data.candidates[0].content.parts[0].text;
              addMessage(botResponse, false);
          } catch (error) {
              addMessage(`Error: ${error.message}`, false);
          } finally {
              hideTypingIndicator();
          }
      });
  });