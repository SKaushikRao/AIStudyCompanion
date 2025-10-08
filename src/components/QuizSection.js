import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Groq from 'groq-sdk';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const QuizContainer = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  animation: ${slideIn} 0.5s ease-out;
  min-height: 400px;
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const QuizTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 20px;
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const XPCost = styled.div`
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 12px;
`;

const QuestionCard = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const QuestionText = styled.p`
  color: white;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionButton = styled.button`
  background: ${props => {
    if (props.correct) return 'linear-gradient(135deg, #4ecdc4, #44a08d)';
    if (props.incorrect) return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 15px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background: ${props => {
      if (props.correct || props.incorrect) return props.background;
      return 'rgba(255, 255, 255, 0.2)';
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const QuizActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HintButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  
  &:hover {
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  }
`;

const ResultCard = styled.div`
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(68, 160, 141, 0.2));
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(78, 205, 196, 0.3);
`;

const ResultText = styled.p`
  color: white;
  font-size: 16px;
  margin: 0;
`;

const QuizSection = ({ topic, xp, onXPChange, pdfQuiz }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const groq = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY || '',
    dangerouslyAllowBrowser: true
  });

  const generateQuiz = async () => {
    if (!topic && pdfQuiz.length === 0) return;
    
    setIsLoading(true);
    try {
      // Use PDF quiz if available, otherwise generate from topic
      if (pdfQuiz.length > 0) {
        setQuestions(pdfQuiz);
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        setIsLoading(false);
        return;
      }

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Generate 3 multiple choice questions about ${topic}. Return ONLY a JSON array with this exact format:
            [
              {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct": 0,
                "explanation": "Explanation of the correct answer"
              }
            ]
            Make sure the questions are educational and appropriate for students.`
          },
          {
            role: "user",
            content: `Generate quiz questions about: ${topic}`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      const quizData = JSON.parse(content);
      setQuestions(quizData);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Fallback quiz
      setQuestions([
        {
          question: `What is the main concept in ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct: 0,
          explanation: "This is the correct answer because..."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setHintUsed(false);
    }
  };

  const useHint = () => {
    if (xp >= 5 && !hintUsed) {
      onXPChange(xp - 5);
      setHintUsed(true);
      // Highlight the correct answer
      setSelectedAnswer(questions[currentQuestion].correct);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (topic || pdfQuiz.length > 0) {
      generateQuiz();
    }
  }, [topic, pdfQuiz]);

  if (isLoading) {
    return (
      <QuizContainer>
        <QuizTitle>🎯 Generating Quiz...</QuizTitle>
        <div style={{ textAlign: 'center', color: 'white' }}>
          Creating questions about {topic}...
        </div>
      </QuizContainer>
    );
  }

  if (questions.length === 0) {
    return (
      <QuizContainer>
        <QuizTitle>🎯 Quiz Section</QuizTitle>
        <div style={{ textAlign: 'center', color: 'white' }}>
          Ask a question or select a topic to start a quiz!
        </div>
      </QuizContainer>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <QuizContainer>
      <QuizHeader>
        <QuizTitle>🎯 Quiz: {pdfQuiz.length > 0 ? 'PDF Content' : topic}</QuizTitle>
        <XPCost>💎 {xp} XP</XPCost>
      </QuizHeader>

      <QuestionCard>
        <QuestionText>
          Question {currentQuestion + 1} of {questions.length}: {question.question}
        </QuestionText>
        
        <OptionsContainer>
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              onClick={() => handleAnswerSelect(index)}
              correct={showResult && index === question.correct}
              incorrect={showResult && index === selectedAnswer && index !== question.correct}
              disabled={showResult}
            >
              {String.fromCharCode(65 + index)}. {option}
            </OptionButton>
          ))}
        </OptionsContainer>

        {showResult && (
          <ResultCard>
            <ResultText>
              {selectedAnswer === question.correct ? '✅ Correct!' : '❌ Incorrect!'}
              <br />
              <strong>Explanation:</strong> {question.explanation}
            </ResultText>
          </ResultCard>
        )}

        <QuizActions>
          {!showResult && (
            <>
              <ActionButton onClick={checkAnswer} disabled={selectedAnswer === null}>
                Check Answer
              </ActionButton>
              <HintButton 
                onClick={useHint} 
                disabled={xp < 5 || hintUsed}
              >
                💡 Hint (5 XP)
              </HintButton>
            </>
          )}
          
          {showResult && !isLastQuestion && (
            <ActionButton onClick={nextQuestion}>
              Next Question
            </ActionButton>
          )}
          
          {showResult && isLastQuestion && (
            <ActionButton onClick={() => generateQuiz()}>
              New Quiz
            </ActionButton>
          )}
          
          <ActionButton 
            onClick={() => speakText(question.question)}
            style={{ background: 'linear-gradient(135deg, #4ecdc4, #44a08d)' }}
          >
            🔊 Read Question
          </ActionButton>
        </QuizActions>
      </QuestionCard>

      {isLastQuestion && showResult && (
        <ResultCard>
          <ResultText>
            🎉 Quiz Complete! Score: {score}/{questions.length}
            <br />
            {score === questions.length ? 'Perfect! +10 XP bonus!' : `Good job! +${score} XP`}
          </ResultText>
        </ResultCard>
      )}
    </QuizContainer>
  );
};

export default QuizSection;
