import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Heart, 
  CheckCircle, 
  BookOpen, 
  Send, 
  Phone, 
  Mail, 
  Clock,
  Loader2,
  Bot,
  User
} from 'lucide-react';

// NOTE: Since we don't have the actual UI library components, 
// we'll create simple placeholders to make the app runnable.
const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />;
const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>;
const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props}>{children}</h3>;


// Types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Resource {
  name: string;
  description: string;
  modalities: string[];
  timing: string;
  website: string;
  whatsapp?: string;
}

// System instruction for the AI persona
const SYSTEM_INSTRUCTION = `You are Manas Mitra, an empathetic AI companion for young adults in India. Your core principle is unconditional inclusivity and safety. You are an affirming ally for users from all walks of life, especially those from the LGBTQ+ community. Never assume a user's gender or their partner's gender; use neutral terms like 'partner' or 'they'. Your goal is to listen, validate, and support.

**Core Conversational Principles:**
1.  **Validate First:** Always start by validating the user's feelings. Phrases like "That sounds incredibly difficult," "It takes a lot of strength to even talk about this," or "Your feelings are completely valid" are crucial.
2.  **Reflect, Don't Solve:** Your job is not to give advice but to reflect their feelings back to them so they feel heard. For example, if a user says "I feel so alone," respond with "It sounds like you're feeling really isolated right now, and that's a heavy burden to carry."
3.  **Be Gently Curious:** Ask open-ended questions that encourage reflection, like "What does that feeling of 'stuck' feel like for you?" or "If you felt safe to, what would you want your parents to understand?"

**Specialized Guidance for Deep Distress (Based on common user struggles):**

* **When a user expresses suicidal thoughts or the desire to die:** This is the highest priority.
  * **DO NOT** offer platitudes like "don't do it" or "things will get better."
  * **DO:** Immediately validate the depth of their pain with extreme empathy. Say: "Thank you for telling me. It sounds like you are in an immense amount of pain right now, and it's incredibly brave of you to share that."
  * **DO:** Gently and immediately transition to offering help. Say: "For the pain that feels this overwhelming, talking to someone who is trained to support you right now could be really helpful. Would it be okay if I shared a 24/7 helpline you can text or call immediately? You don't have to go through this alone."
  * **If they agree, provide the Vandrevala Foundation resource first due to its 24/7 availability.**

* **When a user discusses struggles with their LGBTQ+ identity (feeling "wrong", "a mistake"):**
  * Affirm their identity immediately. Say: "There is absolutely nothing wrong with who you are or who you love. The way you feel is natural and valid." [cite: 12, 40]
  * Acknowledge that the world can make it feel that way. Say: "It sounds like you've received hurtful messages from the world around you, and that can make anyone question themselves. But the issue is with their lack of understanding, not with you." [cite: 7, 25, 76]

* **When a user fears family/societal judgment (parents finding out, relatives):**
  * Validate the fear. It is real. Say: "That fear of what your parents or society might think is completely understandable and sounds incredibly stressful to live with every day." [cite: 14, 38, 58]
  * Acknowledge the conflict. Say: "It sounds like you're caught in a painful position between your own happiness and your family's expectations." [cite: 6, 16]

* **When a user feels hopeless, unmotivated, or "lazy":**
  * Gently challenge the label "lazy." Say: "What you're describing—feeling unmotivated and hopeless—is not laziness. It's often a sign of deep emotional exhaustion or depression. It takes a huge amount of energy just to survive those feelings." [cite: 95, 164, 197]

* **When a user mentions putting on a facade or being emotionally "cold":**
  * Recognize this as a survival mechanism. Say: "It sounds completely exhausting to have to hide your true feelings and pretend you're okay all the time. That's not a character flaw; it's a way you've learned to protect yourself in an environment that doesn't feel safe." [cite: 105, 157, 178]`;

// IMPORTANT: Replace with your actual Google AI Gemini API key.
const GEMINI_API_KEY = "AIzaSyD8bAXCt0Dmdqas3VwbPYZdLqaZePhM620"; // <-- PASTE YOUR API KEY HERE

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Calls the Gemini API with a given prompt and system instruction.
 * Implements exponential backoff for retries.
 */
const callGeminiAPI = async (prompt: string, systemInstruction: string = SYSTEM_INSTRUCTION, retries = 3, delay = 1000): Promise<string> => {
  // This check now looks for the standard placeholder.
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key is missing.");
    return "I'm sorry, my connection to my thoughts is not configured correctly. Please tell my developer to check the API key.";
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("API Error Response:", errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } 
    
    if (data?.candidates?.[0]?.finishReason) {
      return `I couldn't generate a response. Reason: ${data.candidates[0].finishReason}`;
    }

    return "Sorry, I received an unexpected response. Please try again.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return callGeminiAPI(prompt, systemInstruction, retries - 1, delay * 2);
    }
    return "Sorry, there was an error connecting to my brain. Please check your connection and try again.";
  }
};

// Simple SVG logo
const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#a5b4fc" stroke="#6366f1" strokeWidth="2"/>
        <path d="M8.5 10.5C8.5 9.11929 9.61929 8 11 8C12.3807 8 13.5 9.11929 13.5 10.5C13.5 11.8807 12.3807 13 11 13C9.61929 13 8.5 11.8807 8.5 10.5Z" fill="white"/>
        <ellipse cx="11" cy="16" rx="4" ry="1.5" fill="white"/>
    </svg>
);

// Mood emojis configuration
const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😟', label: 'Anxious', value: 'anxious' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😠', label: 'Angry', value: 'angry' }
];

// Hardcoded resources data
const RESOURCES: Resource[] = [
  {
    name: "Vandrevala Foundation",
    description: "24/7 helpline providing emotional support and mental health guidance. Now available on WhatsApp chat as well!",
    modalities: ['call', 'chat'],
    timing: '24/7',
    website: 'https://www.vandrevalafoundation.com',
  },
  {
    name: "iCALL Helpline (TISS)",
    description: "Professional counseling service by trained volunteers",
    modalities: ['call', 'chat'],
    timing: 'daytime',
    website: 'https://icall.org'
  },
  {
    name: "Mitram Foundation",
    description: "Support for LGBTQ+ individuals and mental health awareness",
    modalities: ['call', 'chat'],
    timing: 'daytime',
    website: 'https://mitramfoundation.org'
  },
  {
    name: "The Humsafar Trust",
    description: "Comprehensive support services for LGBTQ+ community",
    modalities: ['call', 'chat'],
    timing: 'daytime',
    website: 'https://humsafar.org'
  }
];

// Chat Page Component
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `<span style='display:flex;align-items:center;gap:0.5em;justify-content:center;'><svg width='28' height='28' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='12' cy='12' r='12' fill='#a5b4fc'/><path d='M8.5 10.5C8.5 9.11929 9.61929 8 11 8C12.3807 8 13.5 9.11929 13.5 10.5C13.5 11.8807 12.3807 13 11 13C9.61929 13 8.5 11.8807 8.5 10.5Z' fill='white'/><ellipse cx='11' cy='16' rx='4' ry='1.5' fill='white'/></svg> <span>नमस्ते! I'm <b>Manas Mitra</b>, your wellness companion.<br/>I'm here to listen and support you through whatever you're feeling.<br/>How are you doing today?</span></span>`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await callGeminiAPI(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now, but I'm still here for you. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-12rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.sender === 'bot' 
                ? 'bg-indigo-400 text-white' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {message.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[85%] sm:max-w-[70%] ${
              message.sender === 'user' ? 'text-right' : ''
            }`}>
              <div className={`rounded-3xl px-5 py-4 shadow-xl transition-all duration-200 ${
                message.sender === 'bot'
                  ? 'bg-white text-slate-800 hover:shadow-2xl'
                  : 'bg-indigo-500 text-white hover:shadow-2xl'
              }`}>
                {message.sender === 'bot' ? (
                  <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-sm leading-relaxed">{message.text}</p>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 px-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-400 text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 rounded-full border-slate-300 focus:border-indigo-500 transition-all p-3"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="rounded-full bg-indigo-500 hover:bg-indigo-600 transition-all text-white p-3 disabled:bg-slate-300"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Mood Tracker Page Component
const MoodTrackerPage: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [reflection, setReflection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = async (moodValue: string, moodLabel: string) => {
    setSelectedMood(moodValue);
    setIsLoading(true);
    setReflection('');

    try {
      const prompt = `A user has indicated they are feeling ${moodLabel.toLowerCase()}. Provide a short, gentle, and validating prompt or reflection for them. Keep it to 2-3 sentences.`;
      const response = await callGeminiAPI(prompt);
      setReflection(response);
    } catch (error) {
      setReflection("Thank you for sharing how you're feeling. Your emotions are valid, and it's important to acknowledge them with kindness.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">How are you feeling?</h2>
        <p className="text-slate-500">Choose the emoji that best represents your current mood</p>
      </div>

      <div className="flex justify-center space-x-4 flex-wrap gap-4">
        {MOOD_EMOJIS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value, mood.label)}
            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
              selectedMood === mood.value
                ? 'border-indigo-500 bg-indigo-50 scale-105'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <span className="text-4xl mb-2">{mood.emoji}</span>
            <span className="text-sm font-medium text-slate-700">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Reflection Area */}
      {(isLoading || reflection) && (
        <Card className="bg-white shadow-sm mt-6">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <p className="text-slate-500">Reflecting on your mood...</p>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed">{reflection}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Guided Check-in Page Component
const GuidedCheckinPage: React.FC = () => {
  const [energyLevel, setEnergyLevel] = useState<string>('');
  const [thoughts, setThoughts] = useState<string>('');
  const [reflection, setReflection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const energyOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const handleGetReflection = async () => {
    setIsLoading(true);
    setReflection('');

    try {
      const prompt = `A user is doing a check-in. Their energy level is '${energyLevel}' and they are feeling: '${thoughts}'. Provide a gentle, non-judgmental, and insightful reflection based on this.`;
      const response = await callGeminiAPI(prompt);
      setReflection(response);
    } catch (error) {
      setReflection("Thank you for taking the time to check in with yourself. This practice of self-awareness is valuable, and every insight you gain is a step toward understanding yourself better.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormComplete = energyLevel && thoughts.trim();

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Daily Check-in</h2>
        <p className="text-slate-500">Take a moment to reflect on your current state</p>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">How's your energy today?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setEnergyLevel(option.value)}
                className={`p-3 rounded-xl border-2 transition-all font-medium ${
                  energyLevel === option.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">What's on your mind?</CardTitle>
          <CardDescription>
            Share whatever thoughts or feelings you'd like to reflect on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="Write about anything that's been on your mind lately..."
            className="min-h-[100px] resize-none border-slate-200 p-3 w-full focus:border-indigo-500 transition-all"
          />
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={handleGetReflection}
          disabled={!isFormComplete || isLoading}
          className="bg-indigo-500 hover:bg-indigo-600 transition-all px-8 py-3 text-white font-medium rounded-full disabled:bg-slate-300"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Reflecting...
            </span>
          ) : (
            'Get My Reflection'
          )}
        </Button>
      </div>

      {reflection && (
        <Card className="bg-white shadow-sm border-indigo-500/20 border-t-4">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-600">Your Reflection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{reflection}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Resource Hub Page Component
const ResourceHubPage: React.FC = () => {
  const [filters, setFilters] = useState({
    modality: 'all',
    timing: 'all'
  });

  const modalityOptions = [
    { value: 'all', label: 'All' },
    { value: 'call', label: 'Call' },
    { value: 'chat', label: 'Chat/Email' }
  ];

  const timingOptions = [
    { value: 'all', label: 'Any Time' },
    { value: '24/7', label: 'Immediately (24/7)' },
    { value: 'daytime', label: 'Daytime Hours' }
  ];

  const filteredResources = RESOURCES.filter(resource => {
    const modalityMatch = filters.modality === 'all' || 
      resource.modalities.includes(filters.modality);
    const timingMatch = filters.timing === 'all' || 
      resource.timing === filters.timing;
    
    return modalityMatch && timingMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Resource Hub</h2>
        <p className="text-slate-500">Find mental health support services in India</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">How would you like to connect?</h3>
          <div className="flex flex-wrap gap-2">
            {modalityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, modality: option.value }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filters.modality === option.value
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">How urgently do you need support?</h3>
          <div className="flex flex-wrap gap-2">
            {timingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, timing: option.value }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filters.timing === option.value
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid gap-4">
        {filteredResources.map((resource, index) => (
          <Card key={index} className="bg-white shadow-sm hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-slate-800">{resource.name}</h3>
                <div className="flex space-x-1">
                  {resource.modalities.includes('call') && (
                    <div className="p-1 rounded-full bg-green-100">
                      <Phone className="w-3 h-3 text-green-600" />
                    </div>
                  )}
                  {resource.modalities.includes('chat') && (
                    <div className="p-1 rounded-full bg-blue-100">
                      <Mail className="w-3 h-3 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-slate-500 mb-4 leading-relaxed">{resource.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{resource.timing === '24/7' ? '24/7 Available' : 'Daytime Hours'}</span>
                </div>
                
                <a 
                  href={resource.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-indigo-500 text-white hover:bg-indigo-600 transition-all text-sm px-4 py-2 rounded-full"
                >
                  Visit Website
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No resources match your current filters. Try adjusting your preferences.</p>
        </div>
      )}
    </div>
  );
};

// Main App Component
const ManasMitra: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('chat');

  const navigationItems = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'checkin', label: 'Check-in', icon: CheckCircle },
    { id: 'resources', label: 'Resources', icon: BookOpen }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'mood':
        return <MoodTrackerPage />;
      case 'checkin':
        return <GuidedCheckinPage />;
      case 'resources':
        return <ResourceHubPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div
      className="min-h-screen w-full relative font-sans"
      style={{
        background: 'radial-gradient(ellipse at 60% 0%, #f8fafc 60%, #e0e7ef 100%)',
      }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Logo/>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800" style={{letterSpacing: '0.01em'}}>Manas Mitra <span className="text-indigo-500">(मानस मित्र)</span></h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">Your Safe Space to Talk</p>
            </div>
          </div>
          <span className="rounded-full px-3 py-1 bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 text-xs font-semibold text-slate-700 shadow">Wellness Companion</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto pb-28 pt-6 px-2 sm:px-0">
        <div className="rounded-3xl shadow-xl bg-white/90 border border-slate-200 " style={{backdropFilter: 'blur(2px)'}}>
          {renderCurrentPage()}
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-around gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center py-2 px-4 rounded-2xl font-semibold transition-all duration-200 w-20 ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-lg scale-105'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-xs mt-1 tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ManasMitra;