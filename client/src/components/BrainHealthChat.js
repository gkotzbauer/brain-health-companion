import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Brain, User, Bot, Download, BarChart3, X, AlertCircle, Unlock, Lock, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { api } from '../utils/api';
import { diagnosticProfile, sessions, getPersonalizedContent } from '../data/sessionContent';

const BrainHealthChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [userProfile, setUserProfile] = useState(diagnosticProfile);
  const [sessionPhase, setSessionPhase] = useState('intro');
  const [baselineResponses, setBaselineResponses] = useState({});
  const [showProgress, setShowProgress] = useState(false);
  const [activeExercise, setActiveExercise] = useState(null);
  const [exerciseState, setExerciseState] = useState({});
  const [answerOptions, setAnswerOptions] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const users = await api.getUsers();
    if (users.length === 0) {
      // Create first user if none exist
      await createNewUser();
    } else {
      setAvailableUsers(users);
      // Load first user by default
      await switchToUser(users[0].id);
    }
  };

  const createNewUser = async () => {
    const nextUserNumber = availableUsers.length + 1;
    const newUserName = `User ${nextUserNumber}`;
    
    try {
      const newUser = await api.createUser(newUserName, diagnosticProfile);
      const updatedUsers = [...availableUsers, newUser];
      setAvailableUsers(updatedUsers);
      await switchToUser(newUser.id);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const switchToUser = async (userId) => {
    // Save current user state before switching
    if (userProfile.userId) {
      await saveConversationState();
    }
    
    // Clear current state
    resetAppState();
    
    // Load new user
    const userData = await api.getUser(userId);
    if (userData) {
      setUserProfile(userData);
      
      // Check for saved conversation state
      const savedState = await api.getConversationState(userId);
      if (savedState && savedState.currentSession) {
        showWelcomeBack(savedState);
      } else {
        showWelcomeMessage(userData);
      }
    }
    
    setShowUserDropdown(false);
  };

  const resetAppState = () => {
    setMessages([]);
    setInputValue('');
    setCurrentSession(null);
    setCurrentModule(0);
    setCurrentSegment(0);
    setAwaitingResponse(false);
    setSessionPhase('intro');
    setBaselineResponses({});
    setActiveExercise(null);
    setExerciseState({});
    setAnswerOptions(null);
  };

  const saveConversationState = async () => {
    if (!userProfile.userId) return;
    
    const conversationState = {
      currentSession: currentSession?.id,
      currentModule,
      currentSegment,
      sessionPhase,
      baselineResponses,
      completedSessions: userProfile.completedSessions,
      messages: messages.slice(-20),
      timestamp: new Date()
    };
    
    try {
      await api.saveConversationState(userProfile.userId, conversationState);
      await api.updateUser(userProfile.userId, userProfile);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const showWelcomeMessage = (profile) => {
    const hasMCI = profile.diagnosis?.includes("Mild Cognitive Impairment");
    const doctor = profile.assessment_info?.clinicians?.[0]?.name || 'your doctor';
    
    let welcomeMessage = `Welcome to your About Me Brain Health Companion. My mission is to give you the personalized insights you need to optimize your brain health and quality of life while aging.

Your ${doctor} recently sent your recent cognitive assessment to me so you can ask me questions about your assessment and I can personalize the brain health education and guidance I provide to you.`;
    
    if (hasMCI) {
      welcomeMessage += `

From your recent assessment at the ${profile.referral_info?.clinic_name || 'Brain Health Clinic'}, I see that you've been diagnosed with Mild Cognitive Impairment. Your overall cognitive score of ${profile.assessment_results?.ACE_III?.total || '98/100'} shows many preserved strengths we can build on.`;
    }
    
    welcomeMessage += `

I see this is your first time using me, your Companion. I can help you understand your diagnosis and your options for minimizing the impact of your diagnosis or I can walk you through a brain health guide I've personalized for you to help you minimize cognitive decline while you age. You can also get started by simply asking me any question that comes to mind. Where would you like to begin?`;
    
    addBotMessage(welcomeMessage, 'welcome');
    setAwaitingResponse({ type: 'welcome' });
    setAnswerOptions(['Understand My Diagnosis', 'Start My Brain Health Guide']);
  };

  const showWelcomeBack = (savedState) => {
    addBotMessage(
      `Welcome back to your About Me Brain Health Companion! I see you've been making progress through the sessions. 

Would you like me to:
1. Highlight what you've learned so far based on your responses
2. Pick up where you left off in Session ${savedState.currentSession}
3. Start a new session`,
      'welcome_back'
    );
    setAwaitingResponse({ type: 'resume_session' });
    setAnswerOptions(['Highlight what I\'ve learned', 'Continue where I left off', 'Start a new session']);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text, type = 'general') => {
    const newMessage = {
      id: Date.now(),
      sender: 'bot',
      text,
      type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserInput = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    processUserResponse(inputValue);
    setInputValue('');
  };

  const processUserResponse = (response) => {
    if (!awaitingResponse) {
      addBotMessage("You can start by choosing 'Understand My Diagnosis' or 'Start My Brain Health Guide'.");
      return;
    }

    const { type } = awaitingResponse;

    switch (type) {
      case 'welcome':
        if (response.includes('Understand') && response.includes('Diagnosis')) {
          addBotMessage("I can help you understand your diagnosis. Would you like to ask me a specific question about your assessment or diagnosis, or would you prefer I provide you with a summary and key insights from your cognitive assessment?");
          setAwaitingResponse({ type: 'diagnosis_choice' });
          setAnswerOptions(['Ask a specific question', 'Provide a summary and key insights']);
        } else if (response.includes('Start') && response.includes('Guide')) {
          showSessionMenu();
        }
        break;

      case 'diagnosis_choice':
        if (response.includes('summary')) {
          provideDiagnosisSummary();
        } else {
          addBotMessage("Please go ahead and ask me any question about your cognitive assessment or diagnosis.");
          setAwaitingResponse({ type: 'user_diagnosis_question' });
          setAnswerOptions(null);
        }
        break;

      case 'segment_discussion':
        handleSegmentResponse(response);
        break;

      default:
        addBotMessage("I didn't quite understand that. Could you please rephrase?");
    }
  };

  const handleSegmentResponse = (response) => {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('yes') && lowerResponse.includes('test')) {
      setAnswerOptions(null);
      startMCIContentQuiz();
    } else if (lowerResponse.includes('no')) {
      setAnswerOptions(null);
      addBotMessage("Would you like to learn more about MCI itself, explore prevention strategies in detail, understand your specific MCI status better, define a personal goal that will work for you? Or shall we move on to the next learning session?");
      setAwaitingResponse({ type: 'segment_discussion' });
      setAnswerOptions(['Learn more about MCI', 'Explore prevention strategies', 'Understand my MCI status', 'Define a personal goal', 'Move to next learning session']);
    }
  };

  const startMCIContentQuiz = () => {
    const quizQuestions = [
      {
        question: "What percentage of people with MCI progress to dementia each year?",
        options: ["5-10%", "10-15%", "20-30%", "40-50%"],
        correct: 1,
        explanation: "About 10-15% of people with MCI progress to dementia each year, which means the majority remain stable."
      },
      {
        question: "Which intervention has the most powerful effect on reducing dementia risk?",
        options: ["Mediterranean diet", "Social engagement", "Physical exercise", "Sleep quality"],
        correct: 2,
        explanation: "Physical exercise is the single most powerful intervention, reducing dementia risk by 30-40%."
      },
      {
        question: "What percentage of people with MCI actually improve and return to normal cognition?",
        options: ["5-10%", "10-20%", "30-40%", "50-60%"],
        correct: 1,
        explanation: "10-20% of people with MCI actually improve and return to normal cognition, showing that MCI is not always progressive."
      }
    ];
    
    setExerciseState({ currentQuestion: 0, score: 0, answers: [], quizType: 'mci_content' });
    addBotMessage("Let's test your understanding of what we just discussed. Here's a quick 3-question quiz:");
    
    setTimeout(() => {
      askContentQuizQuestion(quizQuestions, 0);
    }, 1000);
  };

  const askContentQuizQuestion = (questions, index) => {
    if (index >= questions.length) {
      const score = exerciseState.score;
      const total = questions.length;
      let feedback = `Quiz complete! You got ${score} out of ${total} correct. `;
      
      if (score === total) {
        feedback += "Excellent work! You've really grasped the key concepts about MCI.";
      } else {
        feedback += "Good effort! These are important concepts to understand.";
      }
      
      addBotMessage(feedback);
      setExerciseState({});
      setAnswerOptions(null);
      
      // After quiz, show options
      setTimeout(() => {
        addBotMessage("Now, would you like to learn more about MCI itself, explore prevention strategies in detail, understand your specific MCI status better, define a personal goal that will work for you? Or shall we move on to the next learning session?");
        setAwaitingResponse({ type: 'segment_discussion' });
        setAnswerOptions(['Learn more about MCI', 'Explore prevention strategies', 'Understand my MCI status', 'Define a personal goal', 'Move to next learning session']);
      }, 2000);
      
      return;
    }

    const question = questions[index];
    const optionsText = question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    
    addBotMessage(`**Question ${index + 1}:**\n${question.question}\n\n${optionsText}`);
    setAwaitingResponse({ type: 'content_quiz', questions, questionIndex: index });
    setAnswerOptions(question.options.map((_, i) => `${i + 1}`));
  };

  const provideDiagnosisSummary = () => {
    const aceTotal = parseInt(userProfile.assessment_results?.ACE_III?.total) || 98;
    
    let summary = `Based on your cognitive assessment conducted on ${userProfile.assessment_info?.date}, here's a comprehensive summary of your results:

**Your Diagnosis:** ${userProfile.diagnosis}

**Overall Cognitive Performance:**
You scored ${aceTotal}/100 on the ACE-III cognitive assessment. This is an excellent score that shows many of your cognitive abilities remain well-preserved.

**Key Insights:**
1. Your high overall score shows significant cognitive reserve
2. Your perfect or near-perfect scores in several domains are strengths to build on
3. The specific challenges you face have practical solutions
4. Your long period of stability suggests a favorable prognosis with proper management

Would you like to explore specific strategies for your challenges, or would you prefer to start with the brain health guide?`;
    
    addBotMessage(summary);
    setAwaitingResponse({ type: 'post_summary_choice' });
    setAnswerOptions(['Explore specific strategies', 'Start brain health guide']);
  };

  const showSessionMenu = () => {
    addBotMessage("Here are the available training sessions. Each session takes about 10 minutes. Click on a session to begin:");
    setTimeout(() => {
      addBotMessage("", 'session_menu');
      setAwaitingResponse({ type: 'session_select' });
      setAnswerOptions(null);
    }, 500);
  };

  const startSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    setCurrentSession(session);
    setCurrentModule(0);
    setCurrentSegment(0);
    setSessionPhase('content');
    
    addBotMessage(`Great! Let's begin Session ${session.id}: ${session.title}.`);
    
    setTimeout(() => {
      showNextModule();
    }, 1000);
  };

  const showNextModule = () => {
    if (!currentSession) return;
    
    const content = getPersonalizedContent(currentSession.id, userProfile);
    if (!content || currentModule >= content.modules.length) {
      completeSession();
      return;
    }

    const module = content.modules[currentModule];
    showContentSegment(module);
  };

  const showContentSegment = (module) => {
    if (!module) return;
    
    if (module.segments && module.segments.length > 0) {
      if (currentSegment >= module.segments.length) {
        setCurrentSegment(0);
        setCurrentModule(prev => prev + 1);
        showNextModule();
        return;
      }

      const segment = module.segments[currentSegment];
      addBotMessage(segment.content);
      
      if (segment.discussion) {
        setTimeout(() => {
          addBotMessage(segment.discussion);
          setAwaitingResponse({ type: 'segment_discussion' });
          setAnswerOptions(segment.discussionOptions || ['Continue']);
        }, 2500);
      }
    } else {
      addBotMessage(`**${module.title}**\n\n${module.content}`);
      setTimeout(() => {
        setCurrentModule(prev => prev + 1);
        showNextModule();
      }, 3000);
    }
  };

  const completeSession = () => {
    const sessionId = currentSession.id;
    setUserProfile(prev => ({
      ...prev,
      completedSessions: [...new Set([...prev.completedSessions, sessionId])]
    }));
    
    addBotMessage(`🎉 Congratulations! You've completed Session ${sessionId}: ${currentSession.title}!`);
    setCurrentSession(null);
    
    setTimeout(() => {
      showSessionMenu();
    }, 2000);
  };

  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';
    
    if (message.type === 'session_menu' && isBot) {
      return (
        <div className="space-y-2 max-w-lg">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => startSession(session.id)}
              className="w-full text-left p-3 rounded-lg border bg-white hover:bg-blue-50 border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Unlock className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium">Session {session.id}</div>
                    <div className="text-sm text-gray-600">{session.title}</div>
                  </div>
                </div>
                {userProfile.completedSessions.includes(session.id) && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`flex items-start space-x-2 max-w-[70%] ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isBot ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {isBot ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
          </div>
          <div className={`rounded-lg p-3 ${
            isBot ? 'bg-gray-100 text-gray-800' : 'bg-blue-500 text-white'
          }`}>
            <div className="whitespace-pre-wrap">{message.text}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold">My About Me Brain Health Companion</h1>
              <p className="text-sm text-gray-600">About Me, For Me</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              <BarChart3 className="w-4 h-4" />
              <span>Progress</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select User
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                  {availableUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => switchToUser(user.id)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        user.id === userProfile.userId ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={createNewUser}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              New User
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map(message => (
            <div key={message.id}>{renderMessage(message)}</div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-3xl mx-auto">
          {answerOptions && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {answerOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      addUserMessage(option);
                      processUserResponse(option);
                    }}
                    className="px-4 py-2 rounded-lg border bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUserInput();
                }
              }}
              placeholder="Type your response..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            />
            <button
              onClick={handleUserInput}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainHealthChat;
