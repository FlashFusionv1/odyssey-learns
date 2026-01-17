import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  HelpCircle,
  BookOpen,
  X,
  Minimize2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AITutorChatProps {
  childId: string;
  childName: string;
  gradeLevel: number;
  subject?: string;
  isOpen: boolean;
  onClose: () => void;
}

/** Edge function URL for AI tutor */
const AI_TUTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

const QUICK_PROMPTS = [
  { icon: HelpCircle, label: "Help me understand", prompt: "Can you help me understand this better?" },
  { icon: Lightbulb, label: "Give me a hint", prompt: "Can you give me a hint without telling the answer?" },
  { icon: BookOpen, label: "Explain like I'm 5", prompt: "Can you explain this in a simpler way?" },
];

export function AITutorChat({
  childId,
  childName,
  gradeLevel,
  subject,
  isOpen,
  onClose,
}: AITutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${childName}! 👋 I'm your learning buddy! Ask me anything about ${subject || "your lessons"} and I'll help you understand. What would you like to learn today?`,
      timestamp: new Date(),
      suggestions: ["Help me with math", "Tell me a fun fact", "Quiz me on what I learned"],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  /**
   * Send message to AI tutor edge function with streaming
   */
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      
      conversationHistory.push({ role: "user", content: content.trim() });

      const response = await fetch(AI_TUTOR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: conversationHistory,
          childName,
          gradeLevel,
          subject,
        }),
      });

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Something went wrong!";
        
        if (response.status === 429) {
          toast.error("Taking a quick break! Try again in a moment.");
        } else if (response.status === 402) {
          toast.error("AI credits need to be topped up.");
        }
        
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Stream the response
      let assistantContent = "";
      const assistantId = `assistant-${Date.now()}`;
      
      // Add placeholder message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              // Update the assistant message with streamed content
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Add follow-up suggestions based on content
      const suggestions = generateSuggestions(assistantContent, gradeLevel);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, suggestions }
            : m
        )
      );

    } catch (error) {
      console.error("AI Tutor error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "Oops! Something went wrong. Let's try again! 🔄",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 p-0 shadow-lg"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
    >
      <Card className="shadow-2xl border-2 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Learning Buddy</CardTitle>
                <p className="text-xs opacity-80">Always here to help!</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="h-80" ref={scrollRef}>
          <CardContent className="p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="p-1.5 bg-primary/10 rounded-full h-fit">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-secondary/80"
                            onClick={() => sendMessage(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 items-center"
              >
                <div className="p-1.5 bg-primary/10 rounded-full">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </motion.div>
            )}
          </CardContent>
        </ScrollArea>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => sendMessage(prompt.prompt)}
              disabled={isLoading}
            >
              <prompt.icon className="w-3 h-3 mr-1" />
              {prompt.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!inputValue.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

/**
 * Generate contextual follow-up suggestions based on AI response
 */
function generateSuggestions(response: string, gradeLevel: number): string[] {
  const lowerResponse = response.toLowerCase();
  
  // Math-related suggestions
  if (lowerResponse.includes("math") || lowerResponse.includes("number") || lowerResponse.includes("calculate")) {
    return gradeLevel <= 2 
      ? ["More math fun!", "Try a different one", "I did it!"]
      : ["Explain more", "Give me a harder one", "Show me an example"];
  }
  
  // Reading/Language suggestions
  if (lowerResponse.includes("read") || lowerResponse.includes("story") || lowerResponse.includes("word")) {
    return gradeLevel <= 2
      ? ["Read more!", "What happens next?", "I love stories!"]
      : ["Analyze this further", "Related vocabulary", "Writing tips"];
  }
  
  // Science suggestions
  if (lowerResponse.includes("science") || lowerResponse.includes("experiment") || lowerResponse.includes("discover")) {
    return ["Tell me more!", "How does it work?", "Fun science fact"];
  }
  
  // Emotional/Social suggestions
  if (lowerResponse.includes("feel") || lowerResponse.includes("emotion") || lowerResponse.includes("friend")) {
    return ["That helps!", "What else can I do?", "Thanks buddy! 💙"];
  }
  
  // Default age-appropriate suggestions
  return gradeLevel <= 2
    ? ["Tell me more!", "That's cool!", "What else?"]
    : gradeLevel <= 5
    ? ["Explain differently", "Give me a challenge", "Quiz me!"]
    : ["Dig deeper", "Real-world examples", "Related topics"];
}
