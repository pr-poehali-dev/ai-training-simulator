import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
}

interface TrainerTabProps {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
}

const TrainerTab = ({ messages, inputMessage, setInputMessage, handleSendMessage }: TrainerTabProps) => {
  return (
    <div className="animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50 gradient-primary">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold mb-1">Симуляция диалога</h2>
              <p className="text-white/80 text-sm">Практикуйтесь в реальных сценариях поддержки</p>
            </div>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
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
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-6 bg-muted/20">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Введите ваш ответ..."
                  className="flex-1 bg-background/50"
                />
                <Button onClick={handleSendMessage} className="gradient-primary px-6">
                  <Icon name="Send" size={18} />
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  <span>Время: 02:34</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="MessageSquare" size={14} />
                  <span>Сообщений: {messages.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={14} />
                  <span>Текущий балл: 85</span>
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
                <p className="text-xs font-medium mb-1">✓ Поприветствуйте клиента</p>
                <p className="text-xs text-muted-foreground">Используйте дружелюбный тон</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs font-medium mb-1">• Уточните проблему</p>
                <p className="text-xs text-muted-foreground">Задавайте уточняющие вопросы</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs font-medium mb-1">• Предложите решение</p>
                <p className="text-xs text-muted-foreground">Будьте конкретны и полезны</p>
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
                  <span className="font-semibold">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Профессионализм</span>
                  <span className="font-semibold">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Скорость ответа</span>
                  <span className="font-semibold">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrainerTab;
