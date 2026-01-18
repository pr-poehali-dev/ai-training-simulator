import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  currentScore: number;
}

const Header = ({ currentScore }: HeaderProps) => {
  return (
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
  );
};

export default Header;
