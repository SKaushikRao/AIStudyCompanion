import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
// Import Mediapipe drawing utilities
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { searchYouTubeVideos } from '../utils/youtubeApi';

const FocusContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  min-height: 500px;
  gap: 25px;
`;

const WebcamContainer = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  height: 300px;
  flex-shrink: 0;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease;
  }
`;

const VideoElement = styled.video`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 15px;
`;

const CanvasOverlay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  pointer-events: none;
  border-radius: 15px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: ${props => 
    props.status === 'Focused ✅' 
      ? 'linear-gradient(135deg, #4ecdc4, #44a08d)' 
      : 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
  };
  color: white;
  border-radius: 15px;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px ${props => 
    props.status === 'Focused ✅' 
      ? 'rgba(78, 205, 196, 0.3)' 
      : 'rgba(255, 107, 107, 0.3)'
  };
  animation: ${props => props.status === 'Focused ✅' ? 'pulse' : 'shake'} 2s infinite;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
  
  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
`;

const FocusDot = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.focused ? '#00ff00' : '#ff0000'};
  box-shadow: 0 0 20px ${props => props.focused ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'};
  animation: ${props => props.focused ? 'pulse' : 'blink'} 1s infinite;
  z-index: 10;
  
  @keyframes blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

const FocusMessage = styled.div`
  position: absolute;
  top: 35px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  max-width: 200px;
  text-align: center;
  z-index: 10;
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ControlButton = styled.button`
  padding: 12px 20px;
  background: rgba(99, 102, 241, 0.2);
  color: #ffffff;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s ease;
  width: 100%;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.5);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const DoubtModeButton = styled.button`
  padding: 12px 20px;
  background: ${props => props.active ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 'rgba(255, 107, 107, 0.1)'};
  color: #ffffff;
  border: 1px solid ${props => props.active ? 'rgba(255, 107, 107, 0.5)' : 'rgba(255, 107, 107, 0.2)'};
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #ff5252, #d63031)' : 'rgba(255, 107, 107, 0.2)'};
    border-color: rgba(255, 107, 107, 0.4);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsContainer = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  color: #ffffff;
  flex-shrink: 0;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  opacity: 0.8;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: #4ecdc4;
`;

const FocusMonitor = ({ focusStatus, setFocusStatus, setIsDoubtMode, setYoutubeVideos, setDoubtModeTranscript, setFocusTime }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const buzzerRef = useRef(null);
  
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [focusTime, setFocusTimeLocal] = useState(0);
  const [distractedTime, setDistractedTime] = useState(0);
  const [lastFaceTime, setLastFaceTime] = useState(Date.now());
  const [isDoubtModeActive, setIsDoubtModeActive] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [focusMessage, setFocusMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  // Initialize buzzer sound
  useEffect(() => {
    buzzerRef.current = new Audio('/buzzer.mp3');
    buzzerRef.current.volume = 0.5;
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          console.log('Transcribed:', finalTranscript);
          setDoubtModeTranscript(finalTranscript);
          // Fetch YouTube videos based on transcript
          fetchYouTubeVideos(finalTranscript);
        }
      };
      
      setRecognition(recognition);
    }
  }, []);

  // Focus monitoring logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastFace = now - lastFaceTime;
      
      // More lenient focus detection - only mark as distracted after 5 seconds
      if (timeSinceLastFace > 5000 && faceDetected) {
        setFocusStatus('Distracted ❌');
        setDistractedTime(prev => prev + 1);
        setIsFocused(false);
        setFocusMessage('Stop talking and get back to studying!');
        
        // Play buzzer sound
        if (buzzerRef.current) {
          buzzerRef.current.play().catch(console.error);
        }
      } else if (faceDetected && timeSinceLastFace < 5000) {
        setFocusStatus('Focused ✅');
        setFocusTimeLocal(prev => {
          const newTime = prev + 1;
          if (setFocusTime) {
            setFocusTime(newTime);
          }
          return newTime;
        });
        setIsFocused(true);
        setFocusMessage('Focused, good job!');
      } else if (!faceDetected && timeSinceLastFace > 3000) {
        setFocusStatus('Looking Away');
        setIsFocused(false);
        setFocusMessage('Focus on your studies');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFaceTime, faceDetected, setFocusStatus]);

  // Hand raise detection for doubt mode
  useEffect(() => {
    if (handRaised && !isDoubtModeActive) {
      setIsDoubtModeActive(true);
      setIsDoubtMode(true);
      
      // Start speech recognition
      if (recognition) {
        recognition.start();
      }
    } else if (!handRaised && isDoubtModeActive) {
      setIsDoubtModeActive(false);
      setIsDoubtMode(false);
      
      // Stop speech recognition
      if (recognition) {
        recognition.stop();
      }
    }
  }, [handRaised, isDoubtModeActive, recognition, setIsDoubtMode]);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    setFrameCount(prev => prev + 1);
    
    let ctx;
    try {
      ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Canvas error:', error);
      return;
    }
    
    // Draw face mesh
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      for (const landmarks of results.multiFaceLandmarks) {
        // Draw face mesh with bright blue color
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
          color: '#00bfff',
          lineWidth: 2
        });
        
        // Draw face landmarks with bright cyan
        drawLandmarks(ctx, landmarks, {
          color: '#00ffff',
          lineWidth: 1,
          radius: 2
        });
        
        // Update face detection status
        setFaceDetected(true);
        setLastFaceTime(Date.now());
        console.log('Face detected!', landmarks.length, 'landmarks');
      }
    } else {
      // Only set face not detected if we haven't detected a face for a while
      const timeSinceLastFace = Date.now() - lastFaceTime;
      if (timeSinceLastFace > 1000) { // 1 second delay
        setFaceDetected(false);
        console.log('Face not detected for', timeSinceLastFace, 'ms');
      }
    }
    
    // Draw hand landmarks
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw hand connections with green color
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#00ff00',
          lineWidth: 3
        });
        
        // Draw landmarks with bright red color
        drawLandmarks(ctx, landmarks, {
          color: '#ff0000',
          lineWidth: 2,
          radius: 4
        });
        
        // Check for hand raise (improved detection)
        const wristY = landmarks[0].y;
        const middleFingerY = landmarks[12].y;
        const indexFingerY = landmarks[8].y;
        
        // More sensitive hand raise detection - improved thresholds
        const thumbY = landmarks[4].y;
        const pinkyY = landmarks[20].y;
        
        // Multiple conditions for better hand raise detection
        const isHandRaised = (
          // Original condition: wrist high and fingers up
          (wristY < 0.5 && (middleFingerY < 0.4 || indexFingerY < 0.4)) ||
          // Additional: thumb and pinky also considered
          (wristY < 0.5 && (thumbY < 0.4 || pinkyY < 0.4)) ||
          // Very sensitive: any finger significantly above wrist
          (wristY < 0.6 && (middleFingerY < wristY - 0.1 || indexFingerY < wristY - 0.1))
        );
        
        setHandRaised(isHandRaised);
      }
    } else {
      setHandRaised(false);
    }
  }, []);

  const startWebcam = async () => {
    try {
      // Stop any existing stream first
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      // Request camera permissions with better error handling
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      // Initialize MediaPipe Face Mesh
      if (!faceMeshRef.current) {
        try {
          faceMeshRef.current = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });
          
        faceMeshRef.current.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.1,
          minTrackingConfidence: 0.1
        });
          
          faceMeshRef.current.onResults(onResults);
        } catch (error) {
          console.error('Error initializing FaceMesh:', error);
        }
      }
      
      // Initialize MediaPipe Hands
      if (!handsRef.current) {
        try {
          handsRef.current = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
          
          handsRef.current.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.3
          });
          
          handsRef.current.onResults(onResults);
        } catch (error) {
          console.error('Error initializing Hands:', error);
        }
      }
      
      // Start camera with better error handling
      if (!cameraRef.current) {
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            try {
              if (faceMeshRef.current && handsRef.current && videoRef.current) {
                // Process face mesh
                if (faceMeshRef.current) {
                  await faceMeshRef.current.send({ image: videoRef.current });
                }
                // Process hands
                if (handsRef.current) {
                  await handsRef.current.send({ image: videoRef.current });
                }
              }
            } catch (error) {
              console.error('Error processing frame:', error);
            }
          },
          width: 640,
          height: 480
        });
        
        await cameraRef.current.start();
      }
      
      setIsWebcamActive(true);
      setFocusStatus('Webcam Active');
      
    } catch (error) {
      console.error('Error accessing webcam:', error);
      if (error.name === 'NotAllowedError') {
        alert('Camera access denied. Please allow camera permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera found. Please connect a camera and try again.');
      } else {
        alert('Could not access webcam. Please check your camera and try again.');
      }
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    
    setIsWebcamActive(false);
    setFaceDetected(false);
    setHandRaised(false);
    setFocusStatus('Webcam Off');
  };

  const fetchYouTubeVideos = async (query) => {
    try {
      const videos = await searchYouTubeVideos(query, 3);
      setYoutubeVideos(videos);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  const toggleDoubtMode = () => {
    if (!isWebcamActive) {
      alert('Please start the webcam first to use doubt mode.');
      return;
    }

    if (isDoubtModeActive) {
      // Stop doubt mode
      setIsDoubtModeActive(false);
      setIsDoubtMode(false);
      if (recognition) {
        recognition.stop();
      }
    } else {
      // Start doubt mode
      setIsDoubtModeActive(true);
      setIsDoubtMode(true);
      if (recognition) {
        recognition.start();
      }
    }
  };

  return (
    <FocusContainer>
      <StatusIndicator status={focusStatus}>
        {focusStatus}
      </StatusIndicator>
      
      <WebcamContainer>
        <VideoElement
          ref={videoRef}
          playsInline
          muted
        />
        <CanvasOverlay ref={canvasRef} />
        <FocusDot focused={isFocused} />
        {focusMessage && <FocusMessage>{focusMessage}</FocusMessage>}
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          color: 'white', 
          fontSize: '12px',
          background: 'rgba(0,0,0,0.5)',
          padding: '5px',
          borderRadius: '5px'
        }}>
          Frames: {frameCount} | Face: {faceDetected ? 'Yes' : 'No'} | Hand: {handRaised ? 'Raised' : 'Down'}
        </div>
        
        {isDoubtModeActive && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            animation: 'pulse 1.5s infinite'
          }}>
            🎤 Doubt Mode Active
          </div>
        )}
      </WebcamContainer>
      
      <ControlButton onClick={isWebcamActive ? stopWebcam : startWebcam}>
        {isWebcamActive ? 'Stop Webcam' : 'Start Webcam'}
      </ControlButton>
      
      <DoubtModeButton 
        onClick={toggleDoubtMode} 
        active={isDoubtModeActive}
        disabled={!isWebcamActive}
      >
        {isDoubtModeActive ? '🎤 Stop Doubt Mode' : '🤚 Start Doubt Mode'}
      </DoubtModeButton>
      
      <StatsContainer>
        <h4 style={{ margin: '0 0 15px 0', color: 'white' }}>📊 Focus Statistics</h4>
        <StatItem>
          <StatLabel>Focus Time:</StatLabel>
          <StatValue>{Math.floor(focusTime / 60)}m {focusTime % 60}s</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Distracted Time:</StatLabel>
          <StatValue>{Math.floor(distractedTime / 60)}m {distractedTime % 60}s</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Face Detected:</StatLabel>
          <StatValue>{faceDetected ? 'Yes' : 'No'}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Hand Raised:</StatLabel>
          <StatValue>{handRaised ? 'Yes' : 'No'}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Doubt Mode:</StatLabel>
          <StatValue>{isDoubtModeActive ? 'Active' : 'Inactive'}</StatValue>
        </StatItem>
      </StatsContainer>
    </FocusContainer>
  );
};

export default FocusMonitor;
