# MVP knowlwdge base Builder

A collaborative interface for building the knowlwdge base for MVPs with AI assistance, visual drawing tools, and comprehensive planning features.

## Overview

MVP knowledge Builder is a tool designed to bridge the gap between idea conception and technical implementation by combining conversational AI with visual design capabilities. It helps founders, product managers, and developers translate app ideas into structured plans, requirements, architecture, and mockups.

## Key Features



### 1. Visual Collaboration with Drawing Tools

- Integrated Excalidraw for sketching interface ideas directly in the conversation
- Resizable drawing area for comfortable sketching
- Ability to share sketches with agents for better understanding of visual requirements

### 2. Comprehensive Masterplan Generation

The system generates a structured masterplan document that includes:
- App overview and objectives
- Target audience definition
- Core features and functionality
- Technical stack recommendations
- Conceptual data models
- UI/UX design principles
- Security considerations
- Development phases and milestones
- Potential challenges and solutions
- Future expansion possibilities

### 3. UI/UX Mockup Generation

- Generate SVG mockups based on requirements and sketches
- Visual representation of key screens and user flows
- Iterative refinement based on feedback

### 4. Architectural Planning

- High-level component architecture
- Database schema recommendations
- API endpoint structures
- Technical dependencies and integration points

## Technical Architecture

### Frontend

- **Framework**: Next.js with React 18
- **Styling**: Tailwind CSS for responsive design
- **Drawing Tool**: Excalidraw integration for collaborative sketching
- **State Management**: Custom React hooks for modular state control

### Backend

- **API Framework**: Flask with Python
- **AI Integration**: 
  - Google Gemini 1.5 Pro for conversational AI
  - Anthropic Claude for UI/UX mockup generation
- **Data Persistence**: Session-based storage with potential for database integration

### Component Structure

The application uses a modular component architecture for maximum maintainability:

#### Core Components

1. **Chat Interface**
   - `ChatMessages`: Renders conversation history
   - `MessageInput`: Handles user message input
   - `AgentSelector`: Switches between specialized AI agents

2. **Drawing System**
   - `ChatDrawingTool`: Integrates Excalidraw for sketching
   - `ExcalidrawComponent`: Wrapper for Excalidraw with customizations

3. **Documentation Panel**
   - `RightPanel`: Displays generated documentation
   - Tab-based interface for Requirements/Masterplan, UI/UX, and Architecture

#### Custom Hooks

- `useChatMessages`: Manages chat state and API interactions
- `useDrawingTool`: Controls the drawing interface state
- `useClientSide`: Ensures components render properly with SSR
- `useResizablePanel`: Handles panel resizing for better UX

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+ with pip
- API keys for Google Gemini and Anthropic Claude

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mvp-builder.git
   cd mvp-builder
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your API keys:
     ```
     GOOGLE_API_KEY=your_google_api_key
     CLAUDE_API_KEY=your_claude_api_key
     SECRET_KEY=your_secret_key_for_sessions
     ```

5. Start the development servers:
   - Backend: `python app.py`
   - Frontend: `npm run dev`

6. Open your browser to `http://localhost:3000`

## Development Roadmap

### Phase 1: Core Functionality (Current)
- Conversational requirements gathering
- Basic sketching capabilities
- Masterplan document generation

### Phase 2: Enhanced Visualization
- Improved UI/UX mockup generation
- Component library suggestions
- Color palette recommendations

### Phase 3: Technical Specifications
- Code snippet generation
- Database schema visualization
- API endpoint documentation

### Phase 4: Project Integration
- Export to project management tools
- Development environment setup scripts
- CI/CD template generation

## Contributing

We welcome contributions!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
