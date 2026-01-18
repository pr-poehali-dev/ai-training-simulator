import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const SettingsTab = () => {
  return (
    <div className="animate-fade-in">
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
    </div>
  );
};

export default SettingsTab;
