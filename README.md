# AI Study Partner

An AI-powered study companion with concept maps, focus monitoring, and adaptive chat features.



1. **Three-Panel Modern UI Layout**
   - Left Panel: AI Chat Agent (Groq API integration)
   - Middle Panel: Interactive Concept Map with React Flow
   - Right Panel: Focus Monitor with Webcam + Mediapipe

2. **AI Chat Agent (Groq Integration)**
   - Streaming responses from Groq API
   - Real-time chat interface with typing effects
   - Auto-responses to doubt mode transcripts

3. **Focus Monitoring with Mediapipe**
   - Real-time face mesh detection (blue skeleton overlay)
   - Hand detection with green skeleton overlay
   - Focus status tracking (Focused ✅ / Distracted ❌)
   - Buzzer alerts when distracted for >3 seconds
   - Visual feedback with skeleton overlays

4. **Doubt Mode via Hand Raise**
   - Hand raise detection triggers doubt mode
   - Speech-to-text using Web Speech API
   - Auto-transcription to chat panel
   - YouTube video recommendations based on queries

5. **Interactive Concept Map**
   - Subject selection (Mathematics, Physics, Chemistry, Biology)
   - Interactive nodes with hover effects
   - Explanation level toggles (Overview, Detailed, Simple)
   - Animated connections between concepts

6. **YouTube Integration**
   - Video recommendations based on doubt mode queries
   - Video thumbnails and metadata display
   - Clickable video cards

7. **Modern UI/UX**
   - Gradient backgrounds and glassmorphism effects
   - Smooth animations and hover effects
   - Responsive design
   - Professional color scheme

## 🛠 Tech Stack

- **Frontend**: React 19.1.1
- **Styling**: Styled-components (no Tailwind CSS)
- **AI Chat**: Groq API (Llama3-8b-8192 model)
- **Computer Vision**: Mediapipe (Face Mesh + Hand Detection)
- **Graph Visualization**: React Flow
- **Speech Recognition**: Web Speech API
- **Audio**: HTML5 Audio for buzzer alerts

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- Modern web browser with camera access
- HTTPS connection (required for webcam access)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd studyai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### API Keys Required

1. **Groq API Key**: Already configured in the code
2. **YouTube Data API Key**: Optional (currently using mock data)

To use real YouTube API:
1. Get API key from Google Cloud Console
2. Update `src/utils/youtubeApi.js` with your key
3. Uncomment the real API implementation

## 🎯 How to Use

### Focus Monitoring
1. Click "Start Webcam" in the Focus Monitor panel
2. Allow camera permissions
3. The system will detect your face and hands
4. Blue skeleton overlay shows face detection
5. Green skeleton overlay shows hand detection
6. Buzzer will sound if you look away for >3 seconds

### Doubt Mode
1. Raise your hand above your head
2. The system detects hand raise and activates doubt mode
3. Speak your question clearly
4. Lower your hand to stop recording
5. Your question appears in the chat panel
6. AI responds automatically
7. YouTube videos are recommended based on your question

### Concept Map
1. Select a subject from the dropdown
2. Click on concept nodes to explore
3. Use explanation level buttons (Overview/Detailed/Simple)
4. Interactive graph shows relationships between concepts

### AI Chat
1. Type questions in the chat input
2. Press Enter or click Send
3. AI provides streaming responses
4. Chat history is maintained during session

## 🔧 Configuration

### Mediapipe Models
- Face Mesh: Detects facial landmarks for focus monitoring
- Hands: Detects hand landmarks for doubt mode activation
- Confidence thresholds can be adjusted in `FocusMonitor.js`

### Focus Detection
- Face detection timeout: 3 seconds
- Buzzer sound: `public/buzzer.mp3`
- Status indicators update in real-time

### AI Chat
- Model: Llama3-8b-8192 via Groq
- System prompt: Educational assistant role
- Streaming responses enabled

## 🎨 UI Features

- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Gradients**: Modern gradient backgrounds and buttons
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: High contrast and readable fonts

## 🚧 Future Enhancements

- [ ] Real YouTube Data API integration
- [ ] Spaced repetition algorithm
- [ ] Practice question generation
- [ ] Study session analytics
- [ ] Multiple subject support
- [ ] Offline mode
- [ ] Mobile app version

## 🏆 Hackathon Features

This MVP includes several standout features for hackathon presentation:

1. **Real-time Computer Vision**: Live skeleton overlays showing face and hand detection
2. **AI Integration**: Streaming responses from Groq API
3. **Interactive Visualizations**: Dynamic concept maps with React Flow
4. **Voice Interface**: Hand raise detection + speech-to-text
5. **Focus Monitoring**: Distraction detection with audio alerts
6. **Modern UI**: Professional design with animations and effects
