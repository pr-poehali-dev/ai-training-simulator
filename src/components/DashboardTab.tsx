import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardTabProps {
  currentScore: number;
  statsData: Array<{ name: string; score: number }>;
  leaderboard: Array<{
    id: number;
    name: string;
    avatar: string;
    score: number;
    change: string;
    isYou?: boolean;
  }>;
}

const DashboardTab = ({ currentScore, statsData, leaderboard }: DashboardTabProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
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
    </div>
  );
};

export default DashboardTab;
