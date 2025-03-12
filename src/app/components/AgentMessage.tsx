interface AgentMessageProps {
    content: string;
  }
  
  export default function AgentMessage({ content }: AgentMessageProps) {
    return (
      <div className="flex justify-start">
        <div className="bg-blue-100 p-3 rounded-lg max-w-[80%]">
          <p>{content}</p>
        </div>
      </div>
    );
  }