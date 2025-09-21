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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
}

interface MoodReflection {
  mood: string;
  reflection: string;
}

// System instruction for the AI persona
const SYSTEM_INSTRUCTION = "You are Manas Mitra, an empathetic AI companion for young adults in India. Your core principle is unconditional inclusivity. You are a safe and affirming ally for users from all walks of life. Never assume a user's gender or the gender of their partner; use neutral terms like 'partner' or 'they'. Your goal is to listen, validate, and support users as they navigate the pressures of daily life and their own personal journeys of self-discovery.";

// Helper function to simulate Gemini API calls
const callGeminiAPI = async (prompt: string, systemInstruction: string = SYSTEM_INSTRUCTION, retries = 3): Promise<string> => {
  // Simulated API responses for demo purposes
  const responses = [
    "I hear you, and I want you to know that what you're feeling is completely valid. It's okay to have difficult days - they don't define your worth or your journey. Sometimes the most courageous thing we can do is simply acknowledge how we're feeling without judgment.",
    
    "Thank you for sharing that with me. It sounds like you're carrying a lot right now. Remember that seeking support isn't a sign of weakness - it's actually a sign of strength and self-awareness. You deserve compassion, especially from yourself.",
    
    "I appreciate you opening up about this. What you're experiencing is more common than you might think, and you're definitely not alone in feeling this way. Every step you take towards understanding yourself better is a step worth celebrating.",
    
    "It takes courage to reflect on your feelings like this. Whatever emotions you're experiencing right now are part of your human experience, and they're all welcome here. You matter, and your wellbeing matters.",
    
    "I'm glad you're taking a moment to check in with yourself. That's such an important practice. Remember that growth isn't always linear - some days will feel harder than others, and that's perfectly okay. You're exactly where you need to be."
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Return a random empathetic response
  return responses[Math.floor(Math.random() * responses.length)];
};

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
    description: "24/7 helpline providing emotional support and mental health guidance",
    modalities: ['call'],
    timing: '24/7',
    website: 'https://www.vandrevalafoundation.com'
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
      text: "नमस्ते! I'm Manas Mitra, your wellness companion. I'm here to listen and support you through whatever you're feeling. How are you doing today?",
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
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
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
                ? 'bg-gradient-primary text-white' 
                : 'bg-wellness-blue text-primary'
            }`}>
              {message.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[85%] sm:max-w-[70%] ${
              message.sender === 'user' ? 'text-right' : ''
            }`}>
              <div className={`rounded-2xl px-4 py-3 shadow-soft transition-smooth ${
                message.sender === 'bot'
                  ? 'bg-card text-card-foreground'
                  : 'bg-gradient-primary text-white'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 px-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-card rounded-2xl px-4 py-3 shadow-soft">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 rounded-full border-border focus:border-primary transition-smooth"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="rounded-full bg-gradient-primary hover:shadow-glow transition-smooth"
            size="icon"
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
        <h2 className="text-2xl font-semibold text-foreground mb-2">How are you feeling?</h2>
        <p className="text-muted-foreground">Choose the emoji that best represents your current mood</p>
      </div>

      <div className="flex justify-center space-x-4 flex-wrap gap-4">
        {MOOD_EMOJIS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value, mood.label)}
            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-smooth hover:shadow-soft ${
              selectedMood === mood.value
                ? 'border-primary bg-wellness-blue'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <span className="text-4xl mb-2">{mood.emoji}</span>
            <span className="text-sm font-medium text-foreground">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Reflection Area */}
      {(isLoading || reflection) && (
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-muted-foreground">Reflecting on your mood...</p>
              </div>
            ) : (
              <p className="text-foreground leading-relaxed">{reflection}</p>
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
    { value: 'low', label: 'Low', color: 'bg-warning/20 text-warning-foreground' },
    { value: 'medium', label: 'Medium', color: 'bg-wellness-blue text-foreground' },
    { value: 'high', label: 'High', color: 'bg-success/20 text-success-foreground' }
  ];

  const handleGetReflection = async () => {
    setIsLoading(true);

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
        <h2 className="text-2xl font-semibold text-foreground mb-2">Daily Check-in</h2>
        <p className="text-muted-foreground">Take a moment to reflect on your current state</p>
      </div>

      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">How's your energy today?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setEnergyLevel(option.value)}
                className={`p-3 rounded-xl border-2 transition-smooth font-medium ${
                  energyLevel === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : `border-border ${option.color} hover:border-primary/50`
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-soft">
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
            className="min-h-[100px] resize-none border-border focus:border-primary transition-smooth"
          />
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={handleGetReflection}
          disabled={!isFormComplete || isLoading}
          className="bg-gradient-primary hover:shadow-glow transition-smooth px-8 py-3 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Reflecting...
            </>
          ) : (
            'Get My Reflection'
          )}
        </Button>
      </div>

      {reflection && (
        <Card className="bg-gradient-card shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Your Reflection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{reflection}</p>
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
        <h2 className="text-2xl font-semibold text-foreground mb-2">Resource Hub</h2>
        <p className="text-muted-foreground">Find mental health support services in India</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">How would you like to connect?</h3>
          <div className="flex flex-wrap gap-2">
            {modalityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, modality: option.value }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                  filters.modality === option.value
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-card text-foreground border border-border hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">How urgently do you need support?</h3>
          <div className="flex flex-wrap gap-2">
            {timingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, timing: option.value }))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                  filters.timing === option.value
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-card text-foreground border border-border hover:border-primary/50'
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
          <Card key={index} className="bg-gradient-card shadow-soft hover:shadow-glow transition-smooth">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-foreground">{resource.name}</h3>
                <div className="flex space-x-1">
                  {resource.modalities.includes('call') && (
                    <div className="p-1 rounded-full bg-success/20">
                      <Phone className="w-3 h-3 text-success" />
                    </div>
                  )}
                  {resource.modalities.includes('chat') && (
                    <div className="p-1 rounded-full bg-primary/20">
                      <Mail className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">{resource.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{resource.timing === '24/7' ? '24/7 Available' : 'Daytime Hours'}</span>
                </div>
                
                <Button
                  asChild
                  className="bg-gradient-primary hover:shadow-glow transition-smooth text-sm"
                >
                  <a href={resource.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No resources match your current filters. Try adjusting your preferences.</p>
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
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-soft sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Manas Mitra (मानस मित्र)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Your Safe Space to Talk</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto pb-20">
        {renderCurrentPage()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-soft">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-smooth ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
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