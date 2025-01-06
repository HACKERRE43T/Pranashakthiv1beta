// Function to send the user's message and get a response from the API
async function sendMessage() {
  const userInput = document.getElementById('userInput').value;
  if (!userInput) return; // Ensure there's input before sending a request

  const conversation = document.getElementById('conversation');

  // Display user's input in the conversation area
  conversation.innerHTML += `<div><b>You:</b> ${userInput}</div>`;
  
  // Show typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.innerHTML = `<b>PranaShakthi:</b> ...typing`;
  conversation.appendChild(typingIndicator);

  document.getElementById('userInput').value = '';  // Clear input field

  // Fetching response from API with a delay
  const response = await getResponseFromAPI(userInput);
  
  // Remove typing indicator
  conversation.removeChild(typingIndicator);

  // Display API's response in conversation area
  conversation.innerHTML += `<div><b>PranaShakthi:</b> ${response}</div>`;

  speakResponse(response);  // Convert the response to speech
}

// Function to get a response from the Hugging Face API using Mistral-Nemo-Instruct-2407
async function getResponseFromAPI(input) {
  const apiKey = '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';  // Replace with your Hugging Face API key
  const url = "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407";  // Updated model URL

  const payload = {
      inputs: input,
      parameters: {
          max_length: 150,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 50
      }
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data[0]?.generated_text || "Sorry, I don't have an answer for that.";
  } catch (error) {
      console.error('Error fetching response from Hugging Face API:', error);
      return "Sorry, there was an error getting a response.";
  }
}

// Function to start voice recognition
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.onresult = function(event) {
      const speechResult = event.results[0][0].transcript;
      document.getElementById('userInput').value = speechResult;
      sendMessage();
  };
  recognition.start();
}

// Function to clear the conversation
function clearChat() {
  const conversation = document.getElementById('conversation');
  conversation.innerHTML = ''; // Clear all chat messages
}

// Function to convert the response to speech
function speakResponse(response) {
  const utterance = new SpeechSynthesisUtterance(response);
  const voices = speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => voice.name.includes('Google UK English Female') || voice.name.includes('Google US English Female') || voice.name.includes('Microsoft Zira') || voice.name.includes('Samantha'));

  utterance.voice = femaleVoice || voices[0];
  utterance.pitch = 1;
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

// Page load events and animations
document.addEventListener("DOMContentLoaded", function() {
  const overlay = document.querySelector('.loading-overlay');
  setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.display = 'none', 500);  // Hide overlay after transition
      document.getElementById('chat-container').style.display = 'block';  // Show chat after loading
  }, 2000);  // Loading overlay duration
});

// Function to add messages to the conversation (removing duplication)
function addMessageToConversation(message) {
  const conversation = document.getElementById('conversation');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = message; // Allow HTML to handle bold tags
  conversation.appendChild(messageElement);
  conversation.scrollTop = conversation.scrollHeight; // Scroll to the bottom
}
