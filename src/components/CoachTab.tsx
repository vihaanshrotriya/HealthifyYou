import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2, AlertCircle, Key, RefreshCw, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  time: string;
  isError?: boolean;
}

interface CoachTabProps {
  userProfile: any;
  setActiveTab: (tab: 'dashboard' | 'workouts' | 'meals' | 'coach' | 'profile') => void;
}

export default function CoachTab({ userProfile, setActiveTab }: CoachTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key and chat history
  useEffect(() => {
    const key = localStorage.getItem('geminiApiKey');
    setApiKey(key);

    const storedChat = localStorage.getItem('chatHistory');
    if (storedChat) {
      try {
        setMessages(JSON.parse(storedChat));
      } catch (e) {
        initializeDefaultChat();
      }
    } else {
      initializeDefaultChat();
    }
  }, []);

  // Save chat history
  const saveChatHistory = (updatedMessages: Message[]) => {
    const capped = updatedMessages.slice(-100);
    setMessages(capped);
    localStorage.setItem('chatHistory', JSON.stringify(capped));
  };

  const initializeDefaultChat = () => {
    const defaultMsg: Message = {
      id: 'welcome',
      sender: 'coach',
      text: `Hey ${userProfile.name || 'Alex'}! I'm FitBit, your AI health coach. I can help with diet plans, workouts, sleep tips, and progress analysis.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([defaultMsg]);
    localStorage.setItem('chatHistory', JSON.stringify([defaultMsg]));
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const getTodayKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const buildContextPrompt = () => {
    const todayKey = getTodayKey();
    
    // 1. Meals context
    let caloriesToday = 0;
    let mealsStr = 'No meals logged yet today';
    try {
      const mealHistoryRaw = localStorage.getItem('mealHistory');
      const mealHistory = mealHistoryRaw ? JSON.parse(mealHistoryRaw) : {};
      const todayMeals = mealHistory[todayKey];
      if (todayMeals) {
        const mealKeys = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'] as const;
        const mealsList: string[] = [];
        mealKeys.forEach(key => {
          const list = todayMeals[key] || [];
          if (list.length > 0) {
            const names = list.map((item: any) => `${item.name} (${Math.round(item.calories * item.portionMultiplier)} kcal)`).join(', ');
            mealsList.push(`${key}: ${names}`);
            list.forEach((item: any) => {
              caloriesToday += Math.round(item.calories * item.portionMultiplier);
            });
          }
        });
        if (mealsList.length > 0) {
          mealsStr = mealsList.join('; ');
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Workouts context
    let last3Workouts = 'No workouts logged recently';
    try {
      const workoutHistoryRaw = localStorage.getItem('workoutHistory');
      const workoutHistory = workoutHistoryRaw ? JSON.parse(workoutHistoryRaw) : [];
      if (workoutHistory.length > 0) {
        last3Workouts = workoutHistory.slice(0, 3).map((w: any) => `${w.name} (${w.duration} mins, ${w.calories} kcal on ${w.date})`).join('; ');
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Weight context
    let latestWeight = userProfile.weight || 70;
    try {
      const weightLogRaw = localStorage.getItem('weightLog');
      const weightLog = weightLogRaw ? JSON.parse(weightLogRaw) : [];
      if (weightLog.length > 0) {
        latestWeight = weightLog[weightLog.length - 1].weight;
      }
    } catch (e) {
      console.error(e);
    }

    // System instruction
    return `You are FitBit, a friendly knowledgeable AI health coach. Always reference the user's actual data when giving advice. Use markdown for structured plans.
LIVE APP DATA:
- Calories today: ${caloriesToday}/${userProfile.targetCalories || 2000} kcal
- Meals: ${mealsStr}
- Recent workouts: ${last3Workouts}
- Current weight: ${latestWeight}kg
- Goal: ${userProfile.goal || 'Lose Weight'}
- Dietary preference: ${userProfile.dietaryPreference || 'None'}
- Allergies: ${userProfile.allergies ? userProfile.allergies.join(', ') : 'None'}`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Reset input
    if (!textToSend) setInputText('');

    // Check key
    const currentKey = localStorage.getItem('geminiApiKey');
    if (!currentKey) {
      // Show local message stating key is missing
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: 'To enable AI responses, please add your Gemini API key in Profile > Settings.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      saveChatHistory([...messages, userMsg, errorMsg]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    saveChatHistory(newMessages);
    setIsThinking(true);

    try {
      const contextPrompt = buildContextPrompt();
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${currentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${contextPrompt}\n\nUser message: ${text}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API Request Failed');
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that response. Can you try again?";
      
      const coachMsg: Message = {
        id: Date.now().toString(),
        sender: 'coach',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveChatHistory([...newMessages, coachMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        sender: 'coach',
        text: 'Error connecting to Gemini API. Please make sure your API key is correct and you have an active network connection.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      saveChatHistory([...newMessages, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRetry = (failedMessageText: string) => {
    // Remove the last message if it was an error
    const cleaned = messages.filter(m => !m.isError);
    setMessages(cleaned);
    localStorage.setItem('chatHistory', JSON.stringify(cleaned));
    handleSendMessage(failedMessageText);
  };

  const handleClearChat = () => {
    initializeDefaultChat();
    setShowMenu(false);
  };

  // Helper to parse Markdown bold, italic, headings and lists
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      if (content.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-black text-[#00C853] mt-3 mb-1">{parseInline(content.slice(4))}</h3>;
      }
      if (content.startsWith('## ')) {
        return <h2 key={idx} className="text-base font-extrabold text-[#00C853] mt-4 mb-1.5">{parseInline(content.slice(3))}</h2>;
      }
      if (content.startsWith('# ')) {
        return <h1 key={idx} className="text-lg font-black text-[#00C853] mt-4 mb-2">{parseInline(content.slice(2))}</h1>;
      }
      
      if (content.startsWith('- ') || content.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc pl-5 my-1 text-xs text-gray-700 dark:text-gray-200">
            <li>{parseInline(content.slice(2))}</li>
          </ul>
        );
      }
      
      const numMatch = content.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <ol key={idx} className="list-decimal pl-5 my-1 text-xs text-gray-700 dark:text-gray-200" start={parseInt(numMatch[1])}>
            <li>{parseInline(numMatch[2])}</li>
          </ol>
        );
      }
      
      if (content.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      
      return <p key={idx} className="my-1 text-xs leading-relaxed text-gray-700 dark:text-gray-200">{parseInline(content)}</p>;
    });
  };

  const parseInline = (text: string) => {
    let parts: React.ReactNode[] = [text];
    
    // Parse Bold
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const segments = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        segments.push(<strong key={match.index} className="font-bold text-[#009624] dark:text-[#00C853]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }
      return segments.length > 0 ? segments : part;
    });

    // Parse Italic
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const italicRegex = /\*(.*?)\*/g;
      const segments = [];
      let lastIndex = 0;
      let match;
      while ((match = italicRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        segments.push(<em key={match.index} className="italic">{match[1]}</em>);
        lastIndex = italicRegex.lastIndex;
      }
      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }
      return segments.length > 0 ? segments : part;
    });

    return parts;
  };

  const quickPrompts = [
    "Create a diet plan",
    "Suggest today's workout",
    "Analyze my progress",
    "Give me sleep tips",
    "What should I eat next?"
  ];

  return (
    <div id="app-coach" className="h-[calc(100vh-140px)] min-h-[520px] flex flex-col bg-[#0D0E15] text-white rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden animate-in fade-in duration-200">
      {/* Background gradients */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#00C853]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-[#00C853]/5 rounded-full blur-3xl"></div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#00C853] flex items-center justify-center font-bold text-black text-xl shadow-md border-2 border-white/10">
              🤖
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0D0E15]"></span>
          </div>
          <div>
            <h4 className="font-extrabold text-base text-white tracking-tight">FitBit</h4>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> AI Health Coach
            </p>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer text-gray-300"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-[#1A1C29] border border-white/10 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={handleClearChat}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2 font-bold"
              >
                <Trash2 size={14} /> Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scroll-smooth z-10">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id || idx}
              className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`p-3.5 px-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-[#121829] text-white rounded-br-none border border-white/5' 
                    : 'bg-[#E8F5E9] text-gray-800 rounded-bl-none'
                }`}
              >
                {isUser ? <p className="whitespace-pre-line">{msg.text}</p> : <div className="space-y-1">{parseMarkdown(msg.text)}</div>}
                
                {msg.isError && (
                  <div className="mt-2.5 flex items-center gap-2 border-t border-red-200/50 pt-2 text-[11px] text-red-600 font-medium">
                    <AlertCircle size={13} />
                    <span>Failed to get response</span>
                    <button
                      onClick={() => handleRetry(messages[idx - 1]?.text || '')}
                      className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded font-bold transition-all"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-gray-500 mt-1 font-mono">{msg.time}</span>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex flex-col items-start mr-auto max-w-[85%]">
            <div className="p-3.5 px-4 rounded-2xl bg-[#E8F5E9] text-gray-800 rounded-bl-none flex items-center gap-2.5">
              <span className="text-xs font-semibold text-emerald-700 font-mono">FitBit is planning</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="flex gap-2 py-2 overflow-x-auto shrink-0 z-10 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="bg-white/5 border border-white/10 text-[11px] text-gray-300 px-3.5 py-1.5 rounded-full hover:bg-white/10 hover:border-[#00C853]/50 transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat input form */}
      <div className="pt-3 border-t border-white/10 z-10 shrink-0">
        {!apiKey && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 mb-3 flex items-start gap-2.5">
            <Key size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] text-amber-200 leading-relaxed">
                To enable AI responses, please add your Gemini API key in <button onClick={() => setActiveTab('profile')} className="underline font-bold text-amber-400 cursor-pointer hover:text-amber-300">Profile &gt; Settings</button>.
              </p>
            </div>
          </div>
        )}
        
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-[#00C853]"
        >
          <input
            type="text"
            maxLength={500}
            placeholder="Ask FitBit anything about diet, training, sleep, or history..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:ring-0"
          />
          <div className="flex items-center gap-2 pr-1">
            <span className="text-[9px] font-mono text-gray-500">
              {inputText.length}/500
            </span>
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="bg-[#00C853] hover:bg-[#00E676] disabled:bg-gray-700 disabled:opacity-50 text-black font-bold p-2 rounded-xl transition-colors cursor-pointer"
            >
              <Send size={14} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
