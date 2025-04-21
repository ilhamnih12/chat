import React, { useState, useEffect } from 'react';
import supabase from './supabase';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };

    fetchMessages();

    const subscription = supabase
      .from('messages')
      .on('INSERT', (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const sendMessage = async () => {
    if (input.trim() && username.trim()) {
      await supabase.from('messages').insert([{ text: input, username }]);
      setInput('');
    }
  };

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  return (
    <div>
      <h1>Real-Time Chat</h1>
      {!isUsernameSet ? (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleSetUsername}>Set Username</button>
        </div>
      ) : (
        <div>
          <div style={{ border: '1px solid black', height: '300px', overflowY: 'scroll' }}>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.username}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default App;
