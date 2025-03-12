import { useState } from 'react';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import DrawingTool from '../components/DrawingTool';
import { MessageType, AgentType } from '../types';

export default function Home() {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      sender: 'agent',
      content: 'What kind of MVP are we building today?',
      timestamp: new Date(),
    },
  ]);
  
  const [currentAgent, setCurrentAgent] = useState<AgentType>("Requirements");

  const handleSendMessage = (content: string) => {
    const newUserMessage: MessageType = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    
    // Simulate agent response
    setTimeout(() => {
      let responseContent = "";
      
      // Simple response logic based on the conversation flow from the example
      if (messages.length === 1) {
        responseContent = "Great! Let's define the core features. Could you sketch how you'd like the homepage?";
      } else {
        responseContent = "I understand. Let me ask you about the user authentication requirements. How would you like users to sign up and log in?";
      }
      
      const newAgentMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, newAgentMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>MVP Builder - Sketch Interface</title>
        <meta name="description" content="Build your MVP with a conversational interface" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-blue-500 p-4 text-white">
        <h1 className="text-2xl font-bold">MVP Builder - Sketch Interface</h1>
      </header>

      <main className="container mx-auto p-4 flex flex-col md:flex-row gap-4 h-[calc(100vh-64px)]">
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            currentAgent={currentAgent}
          />
        </div>
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden">
          <DrawingTool />
        </div>
      </main>
    </div>
  );
}