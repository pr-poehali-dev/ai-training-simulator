import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header';
import DashboardTab from '@/components/DashboardTab';
import TrainerTab from '@/components/TrainerTab';
import SettingsTab from '@/components/SettingsTab';

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
      <Header currentScore={currentScore} />

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

          <TabsContent value="dashboard">
            <DashboardTab currentScore={currentScore} statsData={statsData} leaderboard={leaderboard} />
          </TabsContent>

          <TabsContent value="trainer">
            <TrainerTab
              messages={messages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
            />
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

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
