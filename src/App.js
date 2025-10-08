import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ChatPanel from './components/ChatPanel';
import StudyBoard from './components/StudyBoard';
import FocusMonitor from './components/FocusMonitor';
import ErrorBoundary from './components/ErrorBoundary';
import XPBar from './components/XPBar';
import QuizSection from './components/QuizSection';
import './App.css';

// Global error handler for ResizeObserver
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
  }
});

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #2d2d2d 50%, #404040 75%, #525252 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Navbar = styled.nav`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 30px;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavTitle = styled.h1`
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ContentWrapper = styled.div`
  padding: 30px 20px;
  max-width: 1600px;
  margin: 0 auto;
`;

const MainContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
  z-index: 1;
  width: 100%;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(25px);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ThreeColumnSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 25px;
  margin-bottom: 40px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const SingleColumnSection = styled.div`
  width: 100%;
`;

const Header = styled.div`
  padding: 18px 25px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(25px);
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

function App() {
  const [messages, setMessages] = useState([]);
  const [conceptMap, setConceptMap] = useState(null);
  const [focusStatus, setFocusStatus] = useState('Focused ✅');
  const [isDoubtMode, setIsDoubtMode] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [doubtModeTranscript, setDoubtModeTranscript] = useState('');
  const [focusTime, setFocusTime] = useState(0);
  const [xp, setXP] = useState(0);
  const [currentTopic, setCurrentTopic] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [pdfQuiz, setPdfQuiz] = useState([]);

  const handleXPChange = (newXP) => {
    setXP(newXP);
  };

  const handleTopicChange = (topic) => {
    setCurrentTopic(topic);
  };

  const handleStudyPlanGenerated = (plan) => {
    setStudyPlan(plan);
    // Add study plan to chat
    setMessages(prev => [...prev, { 
      text: `📚 Study Plan Generated!\n\n${plan}`, 
      isUser: false, 
      timestamp: new Date() 
    }]);
  };

  const handleQuizGenerated = (quiz) => {
    setPdfQuiz(quiz);
    // Add quiz notification to chat
    setMessages(prev => [...prev, { 
      text: `🎯 Quiz Generated! ${quiz.length} questions based on your PDF content. Check the quiz section below!`, 
      isUser: false, 
      timestamp: new Date() 
    }]);
  };

  return (
    <AppContainer>
      <Navbar>
        <NavTitle>🎓 StudyBuddy</NavTitle>
      </Navbar>
      
      <ContentWrapper>
        <XPBar focusTime={focusTime} onXPChange={handleXPChange} />
        
        <MainContent>
          {/* Main Study Interface */}
          <ThreeColumnSection>
            <Section>
              <Header>🤖 AI Study Companion</Header>
              <ChatPanel 
                messages={messages}
                setMessages={setMessages}
                isDoubtMode={isDoubtMode}
                setIsDoubtMode={setIsDoubtMode}
                onDoubtModeTranscript={doubtModeTranscript}
                onTopicChange={handleTopicChange}
              />
            </Section>
            
            <Section>
              <Header>📚 Interactive Study Board</Header>
              <ErrorBoundary>
                <StudyBoard 
                  conceptMap={conceptMap}
                  setConceptMap={setConceptMap}
                  youtubeVideos={youtubeVideos}
                  onStudyPlanGenerated={handleStudyPlanGenerated}
                  onQuizGenerated={handleQuizGenerated}
                />
              </ErrorBoundary>
            </Section>
            
            <Section>
              <Header>👁️ Focus Monitor</Header>
              <FocusMonitor 
                focusStatus={focusStatus}
                setFocusStatus={setFocusStatus}
                setIsDoubtMode={setIsDoubtMode}
                setYoutubeVideos={setYoutubeVideos}
                setDoubtModeTranscript={setDoubtModeTranscript}
                setFocusTime={setFocusTime}
              />
            </Section>
          </ThreeColumnSection>

          {/* Quiz Section - Separate */}
          <SingleColumnSection>
            <Section>
              <Header>🎯 Interactive Quiz & Assessment</Header>
              <QuizSection 
                topic={currentTopic}
                xp={xp}
                onXPChange={handleXPChange}
                pdfQuiz={pdfQuiz}
              />
            </Section>
          </SingleColumnSection>
        </MainContent>
      </ContentWrapper>
    </AppContainer>
  );
}

export default App;