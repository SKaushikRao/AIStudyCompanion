import React, { useState } from 'react';
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

const UploadContainer = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  animation: ${slideIn} 0.5s ease-out;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

const UploadHeader = styled.h3`
  color: #ffffff;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const UploadArea = styled.div`
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  
  &:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.05);
    transform: translateY(-1px);
  }
  
  ${props => props.isDragOver && `
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
    transform: scale(1.01);
  `}
`;

const UploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const UploadText = styled.p`
  color: #ffffff;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
`;

const UploadSubtext = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin: 8px 0 0 0;
  font-size: 12px;
`;

const FileInput = styled.input`
  display: none;
`;

const ProcessButton = styled.button`
  background: rgba(99, 102, 241, 0.2);
  color: #ffffff;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.3s ease;
  margin-top: 12px;
  
  &:hover {
    background: rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.5);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FileInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
  color: white;
  font-size: 14px;
`;

const PDFUpload = ({ onStudyPlanGenerated, onQuizGenerated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const groq = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY || '',
    dangerouslyAllowBrowser: true
  });

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For demo purposes, we'll simulate PDF text extraction
          // In a real implementation, you'd use a library like pdf-parse or pdfjs-dist
          const mockText = `
            Chapter 1: Introduction to Machine Learning
            Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data.
            
            Key Concepts:
            - Supervised Learning: Learning with labeled data
            - Unsupervised Learning: Finding patterns in unlabeled data
            - Reinforcement Learning: Learning through interaction with environment
            
            Chapter 2: Neural Networks
            Neural networks are computing systems inspired by biological neural networks.
            
            Types of Neural Networks:
            - Feedforward Neural Networks
            - Convolutional Neural Networks (CNNs)
            - Recurrent Neural Networks (RNNs)
            
            Chapter 3: Deep Learning Applications
            Deep learning has revolutionized many fields including computer vision, natural language processing, and speech recognition.
          `;
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 2000));
          resolve(mockText);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const generateStudyPlan = async (text) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI study companion. Create a comprehensive study plan based on the provided content. Structure it with clear sections, learning objectives, and study recommendations."
          },
          {
            role: "user",
            content: `Based on this content, create a detailed study plan:\n\n${text}`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating study plan:', error);
      return 'Error generating study plan. Please try again.';
    }
  };

  const generateQuiz = async (text) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Generate 5 multiple choice questions based on the provided content. Return ONLY a JSON array with this exact format: [{\"question\": \"Question text?\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct\": 0, \"explanation\": \"Explanation\"}]"
          },
          {
            role: "user",
            content: `Generate quiz questions based on this content:\n\n${text}`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating quiz:', error);
      return [];
    }
  };

  const processPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(selectedFile);
      setExtractedText(text);

      // Generate study plan
      const studyPlan = await generateStudyPlan(text);
      onStudyPlanGenerated(studyPlan);

      // Generate quiz
      const quiz = await generateQuiz(text);
      onQuizGenerated(quiz);

    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <UploadContainer>
      <UploadHeader>📄 Upload PDF for Study Plan</UploadHeader>
      
      <UploadArea
        isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('pdf-input').click()}
      >
        <UploadIcon>📁</UploadIcon>
        <UploadText>
          {selectedFile ? selectedFile.name : 'Click to upload or drag & drop PDF'}
        </UploadText>
        <UploadSubtext>
          {selectedFile ? 'Ready to process' : 'Supports PDF files up to 10MB'}
        </UploadSubtext>
      </UploadArea>

      <FileInput
        id="pdf-input"
        type="file"
        accept=".pdf"
        onChange={(e) => handleFileSelect(e.target.files[0])}
      />

      {selectedFile && (
        <FileInfo>
          <strong>Selected File:</strong> {selectedFile.name}<br />
          <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB<br />
          <strong>Type:</strong> {selectedFile.type}
        </FileInfo>
      )}

      {selectedFile && (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <ProcessButton onClick={processPDF} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <LoadingSpinner />
                Processing PDF...
              </>
            ) : (
              '🚀 Generate Study Plan & Quiz'
            )}
          </ProcessButton>
        </div>
      )}
    </UploadContainer>
  );
};

export default PDFUpload;
