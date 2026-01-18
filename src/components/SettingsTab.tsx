import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const SettingsTab = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [dialogsCount, setDialogsCount] = useState<number>(0);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setUploadStatus('Ошибка: Поддерживаются только Excel (.xlsx, .xls) и CSV файлы');
      return;
    }

    setUploadedFile(file);
    setUploadStatus(`Выбран файл: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} МБ)`);
  };

  const handleGoogleSheetsImport = async () => {
    if (!googleSheetsUrl.trim()) {
      setUploadStatus('Ошибка: Введите ссылку на Google Таблицу');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Импорт из Google Sheets...');

    try {
      const response = await fetch('https://functions.poehali.dev/d502ef50-1926-4db0-b56d-67f43e16998c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSheetsUrl })
      });

      const result = await response.json();
      
      if (result.success) {
        setDialogsCount(result.dialogsCount);
        setUploadStatus(`✓ Загружено ${result.dialogsCount} диалогов. База знаний обновлена!`);
      } else {
        setUploadStatus(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus('Ошибка соединения с сервером');
    } finally {
      setIsUploading(false);
    }
  };

  const processFileUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadStatus('Обработка файла...');

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('https://functions.poehali.dev/d502ef50-1926-4db0-b56d-67f43e16998c', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setDialogsCount(result.dialogsCount);
        setUploadStatus(`✓ Загружено ${result.dialogsCount} диалогов. База знаний обновлена!`);
      } else {
        setUploadStatus(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus('Ошибка загрузки файла');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Database" size={20} className="text-primary" />
            База диалогов (1700 примеров)
          </h3>
          <div className="space-y-4">
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="file" className="flex-1">Excel / CSV</TabsTrigger>
                <TabsTrigger value="sheets" className="flex-1">Google Sheets</TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-3 mt-4">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Файл с диалогами (.xlsx, .csv)
                </label>
                <input 
                  type="file" 
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                >
                  <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Нажмите для выбора файла</p>
                  <p className="text-xs text-muted-foreground mt-1">Формат: phrase_source, phrase_content, dialog_id</p>
                </label>
                {uploadedFile && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                    <Icon name="FileSpreadsheet" size={16} className="text-primary" />
                    <span className="text-sm flex-1">{uploadedFile.name}</span>
                  </div>
                )}
                <Button 
                  onClick={processFileUpload}
                  disabled={!uploadedFile || isUploading}
                  className="w-full gradient-primary"
                >
                  {isUploading ? (
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Icon name="Database" size={18} className="mr-2" />
                  )}
                  {isUploading ? 'Обработка...' : 'Загрузить и обработать'}
                </Button>
              </TabsContent>

              <TabsContent value="sheets" className="space-y-3 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Ссылка на Google Таблицу
                  </label>
                  <Input 
                    value={googleSheetsUrl}
                    onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Таблица должна быть доступна по ссылке (Файл → Доступ → Просмотр)
                  </p>
                </div>
                <Button 
                  onClick={handleGoogleSheetsImport}
                  disabled={!googleSheetsUrl || isUploading}
                  className="w-full gradient-primary"
                >
                  {isUploading ? (
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Icon name="Download" size={18} className="mr-2" />
                  )}
                  {isUploading ? 'Импорт...' : 'Импортировать из Google Sheets'}
                </Button>
              </TabsContent>
            </Tabs>

            {uploadStatus && (
              <div className={`p-3 rounded-lg text-sm ${
                uploadStatus.startsWith('✓') 
                  ? 'bg-primary/10 text-primary' 
                  : uploadStatus.startsWith('Ошибка') 
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted/30'
              }`}>
                {uploadStatus}
              </div>
            )}

            {dialogsCount > 0 && (
              <Card className="p-4 bg-primary/10 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Icon name="CheckCircle" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">База загружена</p>
                    <p className="text-sm text-muted-foreground">{dialogsCount} диалогов доступны для обучения</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Zap" size={20} className="text-primary" />
            AI Модель
          </h3>
          <div className="space-y-3">
            <Card className="p-3 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon name="Sparkles" size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">DeepSeek API</p>
                  <p className="text-xs text-muted-foreground">Работает без VPN из России</p>
                </div>
                <Badge className="gradient-primary text-white">Активно</Badge>
              </div>
            </Card>
            <Card className="p-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Icon name="Bot" size={20} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">ChatGPT (Polza)</p>
                  <p className="text-xs text-muted-foreground">Требует прокси</p>
                </div>
                <Badge className="bg-muted">Резерв</Badge>
              </div>
            </Card>
            <div className="p-3 bg-accent/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <Icon name="Info" size={14} className="inline mr-1" />
                AI обучается на ваших 1700 диалогах и отвечает по вашим правилам
              </p>
            </div>
          </div>
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