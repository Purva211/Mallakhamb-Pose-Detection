import React, { useEffect } from 'react';
import { FaComments } from 'react-icons/fa';
import { getChatbotStatus } from '../../services/api';

const getApiHost = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

const API_HOST = getApiHost();
let chatbotInitialized = false;

const ChatbotWidget = () => {
  useEffect(() => {
    if (chatbotInitialized) return;

    const checkAndInit = async () => {
      try {
        const res = await getChatbotStatus();
        if (res.success && res.data && res.data.flowise_online && res.data.chatflow_id) {
          // Check if script is already loaded
          if (!document.getElementById('flowise-embed-script')) {
            const script = document.createElement('script');
            script.id = 'flowise-embed-script';
            script.src = 'https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js';
            script.type = 'module';
            script.async = true;
            script.onload = () => {
              if (window.Chatbot) {
                window.Chatbot.init({
                  chatflowid: res.data.chatflow_id,
                  apiHost: API_HOST,
                });
                chatbotInitialized = true;
              }
            };
            document.body.appendChild(script);
          } else if (window.Chatbot) {
            window.Chatbot.init({
              chatflowid: res.data.chatflow_id,
              apiHost: API_HOST,
            });
            chatbotInitialized = true;
          }
          return true; // successfully initialized
        }
      } catch (err) {
        console.warn('Flowise chatbot initialization check failed:', err);
      }
      return false;
    };

    // Try immediately
    checkAndInit().then((success) => {
      if (success) return;

      // Poll every 5 seconds until Flowise is online and chatflow is imported
      const interval = setInterval(async () => {
        if (chatbotInitialized) {
          clearInterval(interval);
          return;
        }
        const success = await checkAndInit();
        if (success) {
          clearInterval(interval);
        }
      }, 5000);

      return () => clearInterval(interval);
    });
  }, []);

  const openChatbot = () => {
    const bubble = document.querySelector('[class*="flowise"]') ||
      document.querySelector('button[aria-label*="chat" i]') ||
      document.querySelector('#flowise-chatbot-bubble-button');

    if (bubble) {
      bubble.click();
    } else {
      window.dispatchEvent(new CustomEvent('openFlowiseChatbot'));
    }
  };

  return (
    <button
      type="button"
      className="chatbot-trigger"
      onClick={openChatbot}
      aria-label="Open AI Assistant"
      title="Chat with AI Assistant"
    >
      <FaComments />
    </button>
  );
};

export default ChatbotWidget;
