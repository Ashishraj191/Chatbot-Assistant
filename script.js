import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ REPLACE WITH YOUR NEW KEY
const API_KEY = "Enter API KEYS"; 

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const themeToggle = document.getElementById('theme-toggle');

// Initialize chat
let chat = model.startChat({
    history: [],
    generationConfig: {
        maxOutputTokens: 1000,
    },
});

async function sendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.remove();

    appendMessage(userMessage, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';

    const typingDiv = showTypingIndicator();

    try {
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        typingDiv.remove();
        appendMessage(text, 'bot');
    } catch (error) {
        console.error('Error:', error);
        typingDiv.remove();
        appendMessage('Error: ' + error.message, 'bot');
    }
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    // Only format bot messages to avoid XSS from user input
    if (sender === 'bot') {
        bubble.innerHTML = formatMessage(text);
    } else {
        bubble.textContent = text; 
    }

    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Improved basic formatter
function formatMessage(text) {
    let formatted = text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code blocks (simple)
        .replace(/```([\s\S]*?)```/g, '<pre style="background:#333; color:#fff; padding:10px; border-radius:5px; overflow-x:auto;"><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code style="background:#eee; padding:2px 4px; border-radius:3px;">$1</code>')
        // Line breaks
        .replace(/\n/g, '<br>');
        
    return formatted;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingDiv;
}

messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

});
