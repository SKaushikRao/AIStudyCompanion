import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import PDFUpload from './PDFUpload';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const StudyBoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
  min-height: 600px;
  gap: 30px;
`;

const Whiteboard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  height: 400px;
  flex-shrink: 0;
`;

const NetworkContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 11px;
  overflow: hidden;
`;

const UploadSection = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 25px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
`;

const ConceptMapContainer = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
`;

const ControlsPanel = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.active && `
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  `}
`;

const SubjectSelect = styled.select`
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  backdrop-filter: blur(10px);
  
  option {
    background: #2c3e50;
    color: white;
  }
`;

const YouTubeSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  max-height: 300px;
  overflow-y: auto;
`;

const VideoCard = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const VideoThumbnail = styled.img`
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
`;

const VideoInfo = styled.div`
  flex: 1;
  color: white;
`;

const VideoTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
`;

const VideoChannel = styled.p`
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
`;

const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { label: 'Mathematics' },
    style: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '15px',
      padding: '20px',
      fontSize: '16px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { label: 'Algebra' },
    style: {
      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '15px',
      padding: '15px',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
    },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 400, y: 200 },
    data: { label: 'Calculus' },
    style: {
      background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '15px',
      padding: '15px',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
    },
  },
  {
    id: '4',
    type: 'default',
    position: { x: 250, y: 350 },
    data: { label: 'Geometry' },
    style: {
      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '15px',
      padding: '15px',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)',
    },
  },
];

// Removed initialEdges since we're not using React Flow anymore

const StudyBoard = ({ conceptMap, setConceptMap, youtubeVideos, onStudyPlanGenerated, onQuizGenerated }) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [explanationLevel, setExplanationLevel] = useState('overview');
  const [studyPlan, setStudyPlan] = useState('');
  const networkRef = useRef(null);
  const containerRef = useRef(null);

  const generateConceptMap = (subject) => {
    const subjectMaps = {
      mathematics: {
        nodes: initialNodes
      },
      physics: {
        nodes: [
          {
            id: '1',
            data: { label: 'Physics' },
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '20px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            },
          },
          {
            id: '2',
            data: { label: 'Mechanics' },
            style: {
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
            },
          },
          {
            id: '3',
            data: { label: 'Thermodynamics' },
            style: {
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
            },
          },
        ]
      },
      chemistry: {
        nodes: [
          {
            id: '1',
            data: { label: 'Chemistry' },
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '20px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            },
          },
          {
            id: '2',
            data: { label: 'Organic Chemistry' },
            style: {
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
            },
          },
          {
            id: '3',
            data: { label: 'Inorganic Chemistry' },
            style: {
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
            },
          },
        ]
      },
      biology: {
        nodes: [
          {
            id: '1',
            data: { label: 'Biology' },
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '20px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            },
          },
          {
            id: '2',
            data: { label: 'Cell Biology' },
            style: {
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
            },
          },
          {
            id: '3',
            data: { label: 'Genetics' },
            style: {
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
            },
          },
        ]
      }
    };

    const map = subjectMaps[subject] || subjectMaps.mathematics;
    setNodes(map.nodes);
  };

  useEffect(() => {
    generateConceptMap(selectedSubject);
  }, [selectedSubject]);

  // Initialize vis-network
  useEffect(() => {
    if (containerRef.current && nodes.length > 0) {
      const nodesDataSet = new DataSet(nodes.map(node => ({
        id: node.id,
        label: node.data.label,
        color: {
          background: node.data.isWeak ? '#ef4444' : '#3b82f6',
          border: node.data.isWeak ? '#dc2626' : '#2563eb',
          highlight: {
            background: '#8b5cf6',
            border: '#7c3aed'
          }
        },
        font: {
          color: '#333333',
          size: 13,
          face: 'Inter, sans-serif'
        },
        borderWidth: 1,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.3)',
          size: 5,
          x: 2,
          y: 2
        }
      })));

      const edgesDataSet = new DataSet([]);

      const data = {
        nodes: nodesDataSet,
        edges: edgesDataSet
      };

      const options = {
        nodes: {
          shape: 'box',
          margin: 10,
          widthConstraint: {
            maximum: 150
          }
        },
        edges: {
          color: {
            color: '#374151',
            highlight: '#8b5cf6'
          },
          width: 2,
          smooth: {
            type: 'continuous'
          }
        },
        physics: {
          enabled: true,
          stabilization: { iterations: 100 },
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09
          }
        },
        background: {
          color: '#ffffff'
        },
        interaction: {
          hover: true,
          tooltipDelay: 200
        }
      };

      if (networkRef.current) {
        networkRef.current.destroy();
      }

      networkRef.current = new Network(containerRef.current, data, options);

      networkRef.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            console.log('Clicked node:', node.data.label);
          }
        }
      });
    }

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [nodes]);

  const handleStudyPlanGenerated = (plan) => {
    setStudyPlan(plan);
    if (onStudyPlanGenerated) {
      onStudyPlanGenerated(plan);
    }
  };

  const handleQuizGenerated = (quiz) => {
    if (onQuizGenerated) {
      onQuizGenerated(quiz);
    }
  };


  return (
    <StudyBoardContainer>
      <Whiteboard>
        <NetworkContainer ref={containerRef} />
      </Whiteboard>
      
      <UploadSection>
        <PDFUpload 
          onStudyPlanGenerated={handleStudyPlanGenerated}
          onQuizGenerated={handleQuizGenerated}
        />
      </UploadSection>
      
      <ControlsPanel>
        <SubjectSelect 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="mathematics">Mathematics</option>
          <option value="physics">Physics</option>
          <option value="chemistry">Chemistry</option>
          <option value="biology">Biology</option>
        </SubjectSelect>
        
        <ControlButton 
          active={explanationLevel === 'overview'}
          onClick={() => setExplanationLevel('overview')}
        >
          Overview
        </ControlButton>
        
        <ControlButton 
          active={explanationLevel === 'detail'}
          onClick={() => setExplanationLevel('detail')}
        >
          Detailed
        </ControlButton>
        
        <ControlButton 
          active={explanationLevel === 'simple'}
          onClick={() => setExplanationLevel('simple')}
        >
          Simple
        </ControlButton>
      </ControlsPanel>

      <ConceptMapContainer>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          height: '100%', 
          color: 'white',
          textAlign: 'center',
          padding: '20px',
          overflow: 'auto'
        }}>
          <h3 style={{ marginBottom: '20px', fontSize: '24px' }}>📚 Concept Map</h3>
          
          {/* Concept Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '20px', 
            width: '100%',
            maxWidth: '400px',
            marginBottom: '20px'
          }}>
            {nodes.map((node, index) => (
              <div
                key={node.id}
                style={{
                  ...node.style,
                  padding: '15px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
                onClick={() => {
                  console.log('Clicked node:', node.data.label);
                  alert(`Clicked on: ${node.data.label}`);
                }}
              >
                {node.data.label}
              </div>
            ))}
          </div>

          {/* Interactive Flowchart Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            borderRadius: '20px',
            padding: '25px',
            width: '100%',
            maxWidth: '600px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h4 style={{ 
              marginBottom: '20px', 
              fontSize: '20px', 
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center'
            }}>
              🎯 {explanationLevel.charAt(0).toUpperCase() + explanationLevel.slice(1)} Learning Path
            </h4>
            
            {/* Interactive Flowchart */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {explanationLevel === 'overview' && (
                <>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                  >
                    🚀 Start Learning
                  </div>
                  <div style={{ fontSize: '20px', color: '#4ecdc4' }}>⬇️</div>
                  <div style={{
                    background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
                  }}
                  >
                    📚 Study Concepts
                  </div>
                  <div style={{ fontSize: '20px', color: '#4ecdc4' }}>⬇️</div>
                  <div style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                  }}
                  >
                    🎯 Practice & Test
                  </div>
                  <div style={{ fontSize: '20px', color: '#4ecdc4' }}>⬇️</div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(240, 147, 251, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.3)';
                  }}
                  >
                    🏆 Master the Topic!
                  </div>
                </>
              )}
              
              {explanationLevel === 'detail' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                  width: '100%'
                }}>
                  {[
                    { icon: '🔍', title: 'Analyze', color: '#667eea' },
                    { icon: '💡', title: 'Understand', color: '#4ecdc4' },
                    { icon: '🔄', title: 'Practice', color: '#ff6b6b' },
                    { icon: '✅', title: 'Master', color: '#f093fb' }
                  ].map((step, index) => (
                    <div
                      key={index}
                      style={{
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                        padding: '20px',
                        borderRadius: '20px',
                        color: 'white',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 4px 15px ${step.color}40`
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05) rotate(2deg)';
                        e.target.style.boxShadow = `0 6px 20px ${step.color}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1) rotate(0deg)';
                        e.target.style.boxShadow = `0 4px 15px ${step.color}40`;
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{step.icon}</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{step.title}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {explanationLevel === 'simple' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%'
                }}>
                  {[
                    { step: '1', text: 'Learn Basics', emoji: '📖' },
                    { step: '2', text: 'Practice Easy', emoji: '✏️' },
                    { step: '3', text: 'Try Harder', emoji: '🧠' },
                    { step: '4', text: 'Ask for Help', emoji: '🤝' }
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '15px 20px',
                        borderRadius: '15px',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'translateX(10px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {item.step}
                      </div>
                      <div style={{ fontSize: '20px' }}>{item.emoji}</div>
                      <div style={{ color: 'white', fontWeight: '500' }}>{item.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {explanationLevel === 'overview' && (
              <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.6' }}>
                <p><strong>🎯 Learning Path:</strong></p>
                <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                  <li>Start with fundamental concepts</li>
                  <li>Build understanding through practice</li>
                  <li>Connect related topics</li>
                  <li>Apply knowledge to problems</li>
                </ul>
                <p><strong>💡 Study Tips:</strong></p>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>Review regularly</li>
                  <li>Practice with examples</li>
                  <li>Ask questions when stuck</li>
                </ul>
              </div>
            )}
            
            {explanationLevel === 'detail' && (
              <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.6' }}>
                <p><strong>🔬 Detailed Learning Framework:</strong></p>
                <div style={{ marginBottom: '15px' }}>
                  <p><strong>1. Foundation Building:</strong></p>
                  <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                    <li>Master basic principles and definitions</li>
                    <li>Understand core relationships between concepts</li>
                    <li>Build mental models for complex topics</li>
                  </ul>
                  
                  <p><strong>2. Progressive Learning:</strong></p>
                  <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                    <li>Start with simple examples</li>
                    <li>Gradually increase complexity</li>
                    <li>Connect new knowledge to existing understanding</li>
                  </ul>
                  
                  <p><strong>3. Application & Practice:</strong></p>
                  <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                    <li>Solve practice problems</li>
                    <li>Work through real-world scenarios</li>
                    <li>Identify patterns and common approaches</li>
                  </ul>
                  
                  <p><strong>4. Assessment & Review:</strong></p>
                  <ul style={{ paddingLeft: '20px' }}>
                    <li>Test understanding regularly</li>
                    <li>Review and reinforce weak areas</li>
                    <li>Seek feedback and clarification</li>
                  </ul>
                </div>
              </div>
            )}
            
            {explanationLevel === 'simple' && (
              <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.6' }}>
                <p><strong>🌟 Simple Learning Steps:</strong></p>
                <div style={{ 
                  background: 'rgba(78, 205, 196, 0.1)', 
                  padding: '15px', 
                  borderRadius: '10px',
                  marginBottom: '15px'
                }}>
                  <p><strong>Step 1:</strong> Learn the basics first</p>
                  <p><strong>Step 2:</strong> Practice with easy examples</p>
                  <p><strong>Step 3:</strong> Try harder problems</p>
                  <p><strong>Step 4:</strong> Ask for help when needed</p>
                </div>
                <p><strong>🎯 Remember:</strong> Take it one step at a time. Every expert was once a beginner!</p>
              </div>
            )}
          </div>
          
          <p style={{ marginTop: '20px', opacity: 0.8, fontSize: '14px' }}>
            Click on any concept to explore it further
          </p>
        </div>
      </ConceptMapContainer>

      {youtubeVideos.length > 0 && (
        <YouTubeSection>
          <h3 style={{ color: 'white', margin: '0 0 15px 0', fontSize: '16px' }}>
            📺 Recommended Videos
          </h3>
          {youtubeVideos.map((video, index) => (
            <VideoCard key={index} onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}>
              <VideoThumbnail src={video.thumbnail} alt={video.title} />
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>
                <VideoChannel>{video.channel}</VideoChannel>
              </VideoInfo>
            </VideoCard>
          ))}
        </YouTubeSection>
      )}
    </StudyBoardContainer>
  );
};

export default StudyBoard;
