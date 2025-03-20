import React from 'react';
import ReactMarkdown from 'react-markdown';

type MockupType = {
  type: string;
  content: string;
};

interface MockupRendererProps {
  mockups: MockupType[];
}

const MockupRenderer: React.FC<MockupRendererProps> = ({ mockups }) => {
  // Extracts SVG content from text while cleaning markdown code blocks
  const extractSvgFromText = (text: string): string[] => {
    const cleanedText = text.replace(/```svg|```/g, ''); // Remove markdown code block markers
    const svgRegex = /<svg[\s\S]*?<\/svg>/g;
    return cleanedText.match(svgRegex) || [];
  };

  // Processes text and SVGs, ensuring text is properly linked to images
  const getAllMockups = () => {
    const allMockups: { content: string; description: string; type: string }[] = [];

    mockups.forEach((mockup) => {
      if (mockup.type === 'svg') {
        allMockups.push({ content: mockup.content, description: '', type: 'svg' });
      } else if (mockup.type === 'text') {
        const svgs = extractSvgFromText(mockup.content);
        const textParts = mockup.content.split(/<svg[\s\S]*?<\/svg>/);

        if (svgs.length === 0) {
          allMockups.push({ content: '', description: mockup.content, type: 'text' });
        } else {
          svgs.forEach((svg, index) => {
            const description = textParts[index]?.trim() || '';
            allMockups.push({ content: svg, description, type: 'svg' });
          });
        }
      }
    });

    return allMockups;
  };

  const allMockups = getAllMockups();

  if (allMockups.length === 0) {
    return <div className="text-gray-500 text-center py-4">No mockups available</div>;
  }

  return (
    <div className="space-y-8">
      {allMockups.map((mockup, index) => (
        <div key={index} className="mockup-item">
          {/* Description rendered as markdown */}
          {mockup.description && (
            <div className="text-sm mb-2">
              <ReactMarkdown>{mockup.description}</ReactMarkdown>
            </div>
          )}

          {/* SVG Mockup */}
          {mockup.content && (
            <div className="svg-container border rounded-lg overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: mockup.content }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MockupRenderer;
