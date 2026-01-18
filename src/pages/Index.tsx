import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentScore, setCurrentScore] = useState(1247);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Здравствуйте! Как я могу помочь вам сегодня?', time: '14:32' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const statsData = [
    { name: 'Пн', score: 85 },
    { name: 'Вт', score: 92 },
    { name: 'Ср', score: 78 },
    { name: 'Чт', score: 95 },
    { name: 'Пт', score: 88 },
    { name: 'Сб', score: 90 },
    { name: 'Вс', score: 87 },
  ];

  const categoryData = [
    { name: 'Техподдержка', value: 35, color: '#8B5CF6' },
    { name: 'Продажи', value: 28, color: '#D946EF' },
    { name: 'Жалобы', value: 20, color: '#0EA5E9' },
    { name: 'Вопросы', value: 17, color: '#F97316' },
  ];

  const leaderboard = [
    { id: 1, name: 'Анна Петрова', avatar: 'АП', score: 2847, change: '+12%' },
    { id: 2, name: 'Иван Сидоров', avatar: 'ИС', score: 2654, change: '+8%' },
    { id: 3, name: 'Вы', avatar: 'ВС', score: 1247, change: '+15%', isYou: true },
    { id: 4, name: 'Мария Козлова', avatar: 'МК', score: 1189, change: '+5%' },
    { id: 5, name: 'Олег Новиков', avatar: 'ОН', score: 987, change: '+3%' },
  ];

  const history = [
    { id: 1, date: '15 янв 2026', scenario: 'Жалоба на товар', score: 92, duration: '8 мин', result: 'Отлично' },
    { id: 2, date: '14 янв 2026', scenario: 'Вопрос по доставке', score: 88, duration: '6 мин', result: 'Хорошо' },
    { id: 3, date: '14 янв 2026', scenario: 'Техническая проблема', score: 95, duration: '12 мин', result: 'Отлично' },
    { id: 4, date: '13 янв 2026', scenario: 'Возврат средств', score: 78, duration: '15 мин', result: 'Средне' },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages([...messages, {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'ai',
        text: 'Спасибо за ваше сообщение! Я анализирую ситуацию...',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
    
    setInputMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center animate-pulse-glow">
                <Icon name="Sparkles" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI Тренажер
                </h1>
                <p className="text-xs text-muted-foreground">Система обучения сотрудников</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Icon name="Trophy" size={18} className="text-primary" />
                <span className="font-bold text-lg">{currentScore}</span>
                <span className="text-xs text-muted-foreground">баллов</span>
              </div>
              <Avatar className="w-10 h-10 border-2 border-primary/50">
                <AvatarFallback className="gradient-primary text-white">ВС</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card p-1.5 h-auto inline-flex gap-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:gradient-primary data-[state=active]:text-white gap-2">
              <Icon name="LayoutDashboard" size={18} />
              Главная
            </TabsTrigger>
            <TabsTrigger value="trainer" className="data-[state=active]:gradient-primary data-[state=active]:text-white gap-2">
              <Icon name="MessageSquare" size={18} />
              Тренажер
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:gradient-primary data-[state=active]:text-white gap-2">
              <Icon name="BarChart3" size={18} />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:gradient-primary data-[state=active]:text-white gap-2">
              <Icon name="User" size={18} />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:gradient-primary data-[state=active]:text-white gap-2">
              <Icon name="History" size={18} />
              История
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:gradient-primary data-[state=active]:text-white gap-2">
              <Icon name="Settings" size={18} />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card hover-lift p-6 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Icon name="Target" size={24} className="text-primary" />
                  </div>
                  <Badge className="gradient-primary text-white">+15%</Badge>
                </div>
                <h3 className="text-3xl font-bold mb-1">{currentScore}</h3>
                <p className="text-sm text-muted-foreground">Всего баллов</p>
                <Progress value={65} className="mt-3 h-2" />
              </Card>

              <Card className="glass-card hover-lift p-6 border-secondary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-secondary/20">
                    <Icon name="Award" size={24} className="text-secondary" />
                  </div>
                  <Badge className="bg-secondary/20 text-secondary">3 место</Badge>
                </div>
                <h3 className="text-3xl font-bold mb-1">18</h3>
                <p className="text-sm text-muted-foreground">Симуляций пройдено</p>
                <Progress value={45} className="mt-3 h-2" />
              </Card>

              <Card className="glass-card hover-lift p-6 border-accent/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-accent/20">
                    <Icon name="TrendingUp" size={24} className="text-accent" />
                  </div>
                  <Badge className="bg-accent/20 text-accent">Отлично</Badge>
                </div>
                <h3 className="text-3xl font-bold mb-1">87%</h3>
                <p className="text-sm text-muted-foreground">Средний результат</p>
                <Progress value={87} className="mt-3 h-2" />
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Users" size={20} className="text-primary" />
                  Рейтинг стажеров
                </h3>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        user.isYou
                          ? 'bg-primary/10 border border-primary/30 scale-105'
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-lg font-bold text-muted-foreground w-6">{index + 1}</div>
                      <Avatar className={user.isYou ? 'border-2 border-primary' : ''}>
                        <AvatarFallback className={user.isYou ? 'gradient-primary text-white' : ''}>
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.score} баллов</p>
                      </div>
                      <Badge variant={user.change.startsWith('+') ? 'default' : 'secondary'}>
                        {user.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Calendar" size={20} className="text-primary" />
                  Активность за неделю
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="score" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#D946EF" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trainer" className="animate-fade-in">
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
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="TrendingUp" size={20} className="text-primary" />
                  Динамика прогресса
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="PieChart" size={20} className="text-primary" />
                  Категории диалогов
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Award" size={20} className="text-primary" />
                  Достижения и навыки
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: 'Zap', name: 'Быстрый ответ', level: 3 },
                    { icon: 'Heart', name: 'Эмпатия', level: 5 },
                    { icon: 'Shield', name: 'Решение проблем', level: 4 },
                    { icon: 'Star', name: 'Качество', level: 5 },
                  ].map((skill, i) => (
                    <Card key={i} className="p-4 bg-muted/30 hover-lift text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl gradient-primary flex items-center justify-center">
                        <Icon name={skill.icon as any} size={28} className="text-white" />
                      </div>
                      <p className="font-semibold text-sm mb-1">{skill.name}</p>
                      <div className="flex justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className={`w-2 h-2 rounded-full ${
                              j < skill.level ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card p-6 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/50">
                  <AvatarFallback className="gradient-primary text-white text-4xl">ВС</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">Виктор Смирнов</h2>
                <p className="text-muted-foreground mb-4">viktor.smirnov@company.com</p>
                <Badge className="gradient-primary text-white mb-6">Стажер</Badge>
                <Separator className="my-6" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">{currentScore}</p>
                    <p className="text-xs text-muted-foreground">Баллов</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-secondary">18</p>
                    <p className="text-xs text-muted-foreground">Симуляций</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-6">Информация профиля</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Имя</label>
                      <Input defaultValue="Виктор" className="bg-background/50" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Фамилия</label>
                      <Input defaultValue="Смирнов" className="bg-background/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                    <Input defaultValue="viktor.smirnov@company.com" className="bg-background/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Должность</label>
                    <Input defaultValue="Стажер службы поддержки" className="bg-background/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Отдел</label>
                    <Input defaultValue="Клиентская поддержка" className="bg-background/50" />
                  </div>
                  <Button className="gradient-primary w-full">
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <Card className="glass-card">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-2xl font-bold">История симуляций</h2>
                <p className="text-sm text-muted-foreground mt-1">Все ваши завершенные тренировки</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card key={item.id} className="p-4 bg-muted/20 hover-lift cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            item.score >= 90 ? 'bg-primary/20' : item.score >= 80 ? 'bg-accent/20' : 'bg-muted/50'
                          }`}>
                            <span className="text-2xl font-bold">{item.score}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{item.scenario}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={12} />
                                {item.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Clock" size={12} />
                                {item.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            item.result === 'Отлично' ? 'bg-primary/20 text-primary' :
                            item.result === 'Хорошо' ? 'bg-accent/20 text-accent' :
                            'bg-muted text-muted-foreground'
                          }>
                            {item.result}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Database" size={20} className="text-primary" />
                  Загрузка учебных материалов
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Файл с диалогами (.xlsx, .csv)</label>
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Перетащите файл или нажмите для выбора</p>
                      <p className="text-xs text-muted-foreground mt-1">Excel или Google Sheets</p>
                    </div>
                  </div>
                  <Button className="w-full gradient-primary">
                    <Icon name="FileSpreadsheet" size={18} className="mr-2" />
                    Загрузить материалы
                  </Button>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Zap" size={20} className="text-primary" />
                  AI Коннекты
                </h3>
                <Tabs defaultValue="preset" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="preset" className="flex-1">Готовые</TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1">API</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preset" className="space-y-3 mt-4">
                    <Card className="p-3 bg-muted/30 cursor-pointer hover:bg-primary/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon name="Bot" size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">OpenAI GPT-4</p>
                          <p className="text-xs text-muted-foreground">Рекомендуется</p>
                        </div>
                        <Badge className="bg-primary/20 text-primary">Активно</Badge>
                      </div>
                    </Card>
                    <Card className="p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <Icon name="Brain" size={20} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Claude AI</p>
                          <p className="text-xs text-muted-foreground">Альтернатива</p>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  <TabsContent value="custom" className="space-y-3 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">API Endpoint</label>
                      <Input placeholder="https://api.example.com/v1/chat" className="bg-background/50" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
                      <Input type="password" placeholder="sk-..." className="bg-background/50" />
                    </div>
                    <Button className="w-full gradient-primary">
                      <Icon name="Link" size={18} className="mr-2" />
                      Подключить API
                    </Button>
                  </TabsContent>
                </Tabs>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Mail" size={20} className="text-primary" />
                  Уведомления на Email
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email руководителя</label>
                    <Input placeholder="manager@company.com" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Отправлять отчеты после каждой симуляции</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Еженедельная сводка</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Уведомления о достижениях</span>
                    </label>
                  </div>
                  <Button className="w-full gradient-primary">
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить настройки
                  </Button>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Workflow" size={20} className="text-primary" />
                  Интеграция с Битрикс24
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Webhook URL</label>
                    <Input placeholder="https://your-domain.bitrix24.ru/rest/..." className="bg-background/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">ID пользователя</label>
                    <Input placeholder="123" className="bg-background/50" />
                  </div>
                  <Button className="w-full gradient-primary">
                    <Icon name="Link" size={18} className="mr-2" />
                    Подключить Битрикс24
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    После подключения результаты будут автоматически отправляться в вашу CRM
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
