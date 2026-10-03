// Load messages when page loads
document.addEventListener('DOMContentLoaded', loadMessages);

// Handle message form submission
document.getElementById('messageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    const status = document.getElementById('formStatus');
    
    if (!message) {
        return;
    }
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        if (response.ok) {
            input.value = '';
            status.textContent = 'Message sent!';
            status.className = 'status-message success';
            setTimeout(() => {
                status.className = 'status-message';
            }, 3000);
            loadMessages();
        } else {
            status.textContent = 'Error sending message';
            status.className = 'status-message error';
        }
    } catch (error) {
        console.error('Error:', error);
        status.textContent = 'Network error';
        status.className = 'status-message error';
    }
});

async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();
        const messageList = document.getElementById('messageList');
        
        if (messages.length === 0) {
            messageList.innerHTML = '<p class="loading">No messages yet. Be the first!</p>';
            return;
        }
        
        messageList.innerHTML = messages
            .reverse()
            .map(msg => `
                <div class="message-item">
                    <div class="message-text">${escapeHtml(msg.text)}</div>
                    <div class="message-time">${formatTime(msg.timestamp)}</div>
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById('messageList').innerHTML = '<p class="loading error">Error loading messages</p>';
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
