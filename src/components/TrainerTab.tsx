import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useChatGPT } from '@/components/extensions/chatgpt-polza/useChatGPT';

const API_URL = 'https://functions.poehali.dev/9259f856-7eb7-426c-a8dd-f95343979e4d';

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
}

interface Scores {
  empathy: number;
  professionalism: number;
  speed: number;
}

const SCENARIOS = [
  {
    id: 1,
    name: 'Жалоба на товар',
    systemPrompt: `Ты — разозлённый клиент интернет-магазина. Ты заказал товар 5 дней назад, но он до сих пор не пришёл. Ты очень недоволен и требуешь решения. Веди себя агрессивно в начале, но постепенно успокаивайся, если сотрудник поддержки проявляет эмпатию и предлагает конкретные решения. Используй короткие реплики, выражай эмоции. Если сотрудник груб — становись ещё злее.`,
    firstMessage: 'Где мой заказ?! Я жду уже 5 дней! Это просто издевательство!'
  },
  {
    id: 2,
    name: 'Вопрос по доставке',
    systemPrompt: `Ты — спокойный клиент, который хочет узнать статус своей посылки. Ты заказал товар 2 дня назад и хочешь понять, когда он придёт. Будь вежливым, но настойчивым. Задавай уточняющие вопросы.`,
    firstMessage: 'Здравствуйте! Я заказал товар позавчера. Можете подсказать, когда ожидать доставку?'
  },
  {
    id: 3,
    name: 'Возврат средств',
    systemPrompt: `Ты — требовательный клиент, который хочет вернуть деньги за товар, не соответствующий описанию. Ты знаешь свои права и настаиваешь на возврате. Будь настойчивым, но не грубым.`,
    firstMessage: 'Товар не соответствует описанию на сайте. Требую вернуть деньги!'
  }
];

const TrainerTab = () => {
  const { generate, isLoading } = useChatGPT({ apiUrl: API_URL });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]);
  const [scores, setScores] = useState<Scores>({ empathy: 0, professionalism: 0, speed: 100 });
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  const analyzeResponse = (userMessage: string): Scores => {
    const lowerMessage = userMessage.toLowerCase();
    
    const empathyWords = ['понимаю', 'извините', 'приношу извинения', 'сожалею', 'помогу', 'поддержка'];
    const professionalWords = ['заказ', 'доставка', 'возврат', 'проверю', 'уточню', 'система', 'статус'];
    const rudeWords = ['ваша вина', 'не моя проблема', 'сами виноваты', 'что вы хотите'];
    
    let empathy = 50;
    let professionalism = 50;
    
    empathyWords.forEach(word => {
      if (lowerMessage.includes(word)) empathy += 15;
    });
    
    professionalWords.forEach(word => {
      if (lowerMessage.includes(word)) professionalism += 12;
    });
    
    rudeWords.forEach(word => {
      if (lowerMessage.includes(word)) {
        empathy -= 30;
        professionalism -= 20;
      }
    });
    
    if (userMessage.length < 20) {
      professionalism -= 10;
    }
    
    const responseTime = (Date.now() - sessionStartTime) / 1000;
    const speed = Math.max(30, 100 - (responseTime / 60) * 20);
    
    return {
      empathy: Math.min(100, Math.max(0, empathy)),
      professionalism: Math.min(100, Math.max(0, professionalism)),
      speed: Math.min(100, Math.max(0, speed))
    };
  };

  const startNewSimulation = async () => {
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(randomScenario);
    setMessages([{
      id: 1,
      sender: 'ai',
      text: randomScenario.firstMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }]);
    setScores({ empathy: 0, professionalism: 0, speed: 100 });
    setSessionStartTime(Date.now());
    setIsSimulationActive(true);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    const newScores = analyzeResponse(inputMessage);
    setScores(newScores);
    
    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'assistant' as const : 'user' as const,
      content: msg.text
    }));
    
    const result = await generate({
      messages: [
        { role: 'system', content: currentScenario.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: inputMessage }
      ],
      model: 'openai/gpt-4o-mini',
      temperature: 0.8,
      max_tokens: 200
    });
    
    if (result.success && result.content) {
      const aiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: result.content,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  useEffect(() => {
    startNewSimulation();
  }, []);

  return (
    <div className="animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50 gradient-primary">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold mb-1">Симуляция диалога</h2>
              <p className="text-white/80 text-sm">Сценарий: {currentScenario.name}</p>
            </div>
            <Button 
              onClick={startNewSimulation}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Icon name="Play" size={18} className="mr-2" />
              Начать новую симуляцию
            </Button>
          </div>
        </div>

        <div className="flex h-[600px]">
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        msg.sender === 'user'
                          ? 'gradient-primary text-white'
                          : 'bg-muted/50 text-foreground'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/50 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-6 bg-muted/20">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Введите ваш ответ..."
                  className="flex-1 bg-background/50"
                  disabled={isLoading || !isSimulationActive}
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="gradient-primary px-6"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Icon name="Send" size={18} />
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="MessageSquare" size={14} />
                  <span>Сообщений: {messages.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={14} />
                  <span>Средний балл: {Math.round((scores.empathy + scores.professionalism + scores.speed) / 3)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-80 border-l border-border/50 bg-muted/10 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Lightbulb" size={18} className="text-primary" />
              Подсказки
            </h3>
            <div className="space-y-3">
              <Card className="p-3 bg-primary/10 border-primary/20">
                <p className="text-xs font-medium mb-1">✓ Проявите эмпатию</p>
                <p className="text-xs text-muted-foreground">Покажите понимание проблемы клиента</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs font-medium mb-1">• Предложите решение</p>
                <p className="text-xs text-muted-foreground">Будьте конкретны и полезны</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs font-medium mb-1">• Используйте профессиональную лексику</p>
                <p className="text-xs text-muted-foreground">Говорите о статусе заказа, доставке</p>
              </Card>
            </div>

            <Separator className="my-6" />

            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Brain" size={18} className="text-secondary" />
              AI Оценка
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Эмпатия</span>
                  <span className="font-semibold">{Math.round(scores.empathy)}%</span>
                </div>
                <Progress value={scores.empathy} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Профессионализм</span>
                  <span className="font-semibold">{Math.round(scores.professionalism)}%</span>
                </div>
                <Progress value={scores.professionalism} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Скорость ответа</span>
                  <span className="font-semibold">{Math.round(scores.speed)}%</span>
                </div>
                <Progress value={scores.speed} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrainerTab;
