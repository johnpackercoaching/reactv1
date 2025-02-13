import React, { useState, useEffect } from 'react';
import { MessageCircle, Home, Settings, Users, Mail, ScrollText, FileText, RefreshCw } from 'lucide-react';
import socratesImage from '../assets/Socrates_real.png';
import cerebroLogo from '../assets/cerebro_logo.png';

// Add these simple page components
const DocumentsPage = () => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4">Documents</h2>
    <p>Documents page content will go here.</p>
  </div>
);

const ResourcesPage = () => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4">Resources</h2>
    <p>Resources and learning materials will be displayed here.</p>
  </div>
);

const SettingsPage = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch current system prompt
    const fetchPrompt = async () => {
      try {
        const response = await fetch(`${API_URL}/api/system-prompt`);
        const data = await response.json();
        setSystemPrompt(data.prompt);
      } catch (err) {
        setError('Failed to load system prompt');
      }
    };
    fetchPrompt();
  }, []);

  const handleSavePrompt = async () => {
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/system-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: systemPrompt })
      });
      if (!response.ok) throw new Error('Failed to save');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save system prompt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">System Prompt</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Edit Prompt
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSavePrompt}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {isEditing ? (
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full h-64 p-3 border rounded-md font-mono text-sm"
            placeholder="Enter the system prompt..."
          />
        ) : (
          <pre className="w-full h-64 p-3 bg-gray-50 rounded-md overflow-auto font-mono text-sm">
            {systemPrompt}
          </pre>
        )}
      </div>
    </div>
  );
};

// Main chat content component
const ChatContent = ({ messages, handleSubmit, inputMessage, setInputMessage, serverStatus }) => (
  <>
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white shadow-sm border border-gray-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Socrates a question..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!serverStatus.backend}
          className={`px-6 py-2 rounded-full font-medium ${
            serverStatus.backend
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  </>
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const SocratesChat = () => {
  const INITIAL_GREETING = "Greetings! I am Socrates. What question shall we explore together?";

  const [serverStatus, setServerStatus] = useState({
    frontend: true,
    backend: false
  });
  const [messages, setMessages] = useState([
    { role: 'assistant', content: INITIAL_GREETING }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [activePage, setActivePage] = useState('chat');

  const sidebarItems = [
    { icon: MessageCircle, label: 'Chat with Socrates', id: 'chat' },
    { icon: FileText, label: 'Documents', id: 'documents' },
    { icon: ScrollText, label: 'Resources', id: 'resources' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/api/hello`);
        setServerStatus(prev => ({
          ...prev,
          backend: response.ok
        }));
      } catch (error) {
        setServerStatus(prev => ({
          ...prev,
          backend: false
        }));
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    
    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputMessage })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I am unable to respond at the moment. Please try again later.' 
      }]);
    }
    
    setInputMessage('');
  };

  const handleRefresh = () => {
    setMessages([
      { role: 'assistant', content: INITIAL_GREETING }
    ]);
    setInputMessage('');
  };

  // Function to render the active page content
  const renderActivePage = () => {
    switch (activePage) {
      case 'chat':
        return (
          <ChatContent
            messages={messages}
            handleSubmit={handleSubmit}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            serverStatus={serverStatus}
          />
        );
      case 'documents':
        return <DocumentsPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatContent />;
    }
  };

  // Function to get the header title based on active page
  const getHeaderTitle = () => {
    switch (activePage) {
      case 'chat':
        return 'Chat with Socrates';
      case 'documents':
        return 'Documents';
      case 'resources':
        return 'Resources';
      case 'settings':
        return 'Settings';
      default:
        return 'Chat with Socrates';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - updated to match image */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <img 
              src={cerebroLogo} 
              alt="Cerebro Logo" 
              className="w-8 h-8"
              style={{ objectFit: 'contain' }}
            />
            <h1 className="text-2xl font-semibold text-gray-900">Cerebro</h1>
          </div>
          
          {/* Server Status - styled to match image */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-700">Server Status</h2>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <span className="text-gray-600">Frontend:</span>
                <div className={`ml-2 w-2 h-2 rounded-full ${serverStatus.frontend ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="ml-2 text-gray-600">{serverStatus.frontend ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Backend:</span>
                <div className={`ml-2 w-2 h-2 rounded-full ${serverStatus.backend ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="ml-2 text-gray-600">{serverStatus.backend ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - styled to match image */}
        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50
                ${activePage === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-3 text-base">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {activePage === 'chat' && (
              <img 
                src={socratesImage} 
                alt="Socrates Bust" 
                className="w-8 h-8 rounded-full"
                style={{ objectFit: 'cover' }}
              />
            )}
            <h2 className="text-xl font-semibold text-gray-800">{getHeaderTitle()}</h2>
          </div>
          {activePage === 'chat' && (
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Restart conversation"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {renderActivePage()}
      </div>
    </div>
  );
};

export default SocratesChat; 