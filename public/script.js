const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const button = form.querySelector('button');

let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';
  button.disabled = true;
  button.textContent = 'Thinking...';

  const thinkingMsg = appendThinkingAnimation();

  conversation.push({ role: 'user', text: userMessage });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    const data = await response.json();
    thinkingMsg.remove();

    if (data.error) {
      appendMessage('bot', `Error: ${data.error}`);
    } else {
      const cleanedText = cleanMarkdown(data.result);
      appendMessage('bot', cleanedText);
      conversation.push({ role: 'model', text: data.result });
    }
  } catch (error) {
    thinkingMsg.remove();
    appendMessage('bot', `Connection error: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = 'Kirim';
  }
});

function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
}

function appendThinkingAnimation() {
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot', 'thinking');
  msg.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  msg.style.whiteSpace = 'pre-wrap';
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
