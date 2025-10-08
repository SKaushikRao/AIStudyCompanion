import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const XPBarContainer = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 999;
  max-width: 90vw;
  box-sizing: border-box;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
`;

const XPInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-weight: 500;
  font-size: 13px;
`;

const XPProgressBar = styled.div`
  width: 180px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const XPFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
  transition: width 0.5s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const LevelBadge = styled.div`
  background: rgba(99, 102, 241, 0.2);
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid rgba(99, 102, 241, 0.3);
`;

const XPText = styled.div`
  font-size: 14px;
  min-width: 80px;
`;

const XPNotification = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
  animation: ${bounce} 0.5s ease-in-out;
  z-index: 1001;
`;

const XPBar = ({ focusTime, onXPChange }) => {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');

  // XP calculation based on focus time
  useEffect(() => {
    if (focusTime > 0 && focusTime % 10 === 0) {
      const newXP = Math.floor(focusTime / 10);
      if (newXP > xp) {
        setXP(newXP);
        setLevel(Math.floor(newXP / 50) + 1);
        setNotificationText(`+1 XP! (${newXP} total)`);
        setShowNotification(true);
        onXPChange(newXP);
        
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
      }
    }
  }, [focusTime, xp, onXPChange]);

  const xpToNextLevel = 50 - (xp % 50);
  const currentLevelXP = xp % 50;
  const progressPercentage = (currentLevelXP / 50) * 100;

  return (
    <>
      <XPBarContainer>
        <XPInfo>
          <LevelBadge>Level {level}</LevelBadge>
          <XPProgressBar>
            <XPFill style={{ width: `${progressPercentage}%` }} />
          </XPProgressBar>
          <XPText>{xp} XP</XPText>
        </XPInfo>
      </XPBarContainer>
      
      {showNotification && (
        <XPNotification>
          {notificationText}
        </XPNotification>
      )}
    </>
  );
};

export default XPBar;
