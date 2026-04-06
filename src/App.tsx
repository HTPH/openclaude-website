import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  Trash2,
  Bot,
  User,
  MoreHorizontal,
  Moon,
  Sun,
  AlertCircle,
} from 'lucide-react';
import './App.css';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

function parseError(status: number, body?: any): string {
  const errorDetail = body?.error?.message || '';
  if (status === 429) {
    return 'Rate limited (429) — model free ถูกใช้งานเกิน quota ลองเปลี่ยน model ใน .env หรือรอซักครู่';
  }
  if (status === 401) return 'API key ไม่ถูกต้อง';
  if (status === 404) return 'Model ไม่พบหรือไม่ได้เปิดใช้งาน';
  return `API error ${status}${errorDetail ? ': ' + errorDetail : ''}`;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL;
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const model = import.meta.env.VITE_OPENAI_MODEL;

    const apiMessages = messages
      .filter((m) => m.role !== 'error')
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
    apiMessages.push({ role: 'user', content: userMsg.content });

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 15_000; // 15s

    try {
      let res: Response;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, messages: apiMessages }),
        });

        if (res.status === 429) {
          if (attempt < MAX_RETRIES) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'error',
                content: `Rate limited — retrying in 15s (attempt ${attempt}/${MAX_RETRIES - 1})…`,
              },
            ]);
            await new Promise((r) => setTimeout(r, RETRY_DELAY));
            continue;
          }
        }

        break;
      }

      if (!res!.ok) {
        const body = await res!.json().catch(() => ({}));
        throw new Error(parseError(res!.status, body));
      }

      const data = await res!.json();
      const botContent =
        data.choices?.[0]?.message?.content || '(No response)';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botContent },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card p-4">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">OpenClaude</h1>
        </div>
        <Separator className="mb-4" />
        <Button variant="ghost" className="justify-start gap-2" onClick={handleClear} disabled={loading}>
          <Trash2 className="h-4 w-4" />
          New Chat
        </Button>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Badge variant="secondary" className="text-[10px]">
            {import.meta.env.VITE_OPENAI_MODEL?.split('/')[1] || 'unknown'}
          </Badge>
          <span>via OpenRouter</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 md:hidden text-primary" />
            <CardTitle className="text-sm font-medium text-foreground">
              Chat with AI
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDark(!dark)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClear} disabled={loading}>
                  Clear Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Bot className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-sm">Send a message to start chatting</p>
                <p className="text-xs mt-1 text-muted-foreground/60">
                  Model: {import.meta.env.VITE_OPENAI_MODEL}
                </p>
              </div>
            )}
            {messages.map((msg, idx) =>
              msg.role === 'error' ? (
                <div key={idx} className="flex gap-3 justify-center">
                  <Card className="bg-destructive/10 border-destructive/30 max-w-[85%]">
                    <CardContent className="p-3 flex gap-2 items-start">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-destructive whitespace-pre-wrap break-words">{msg.content}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <Card className={msg.role === 'user' ? 'bg-primary text-primary-foreground max-w-[75%]' : 'bg-muted max-w-[75%]'}>
                    <CardContent className="p-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </CardContent>
                  </Card>
                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )
            )}
            {loading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                </Avatar>
                <Card className="bg-muted">
                  <CardContent className="p-3 text-sm text-muted-foreground italic">
                    Thinking...
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t bg-card p-4">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-2 flex gap-2">
              <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;
