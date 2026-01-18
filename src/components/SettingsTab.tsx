import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const SettingsTab = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [dialogsCount, setDialogsCount] = useState<number>(0);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>('');
  const [extractedProblems, setExtractedProblems] = useState<string[]>([]);
  const [extractedProducts, setExtractedProducts] = useState<string[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    `Проанализируй все загруженные диалоги и извлеки из них:

1. **Типичные проблемы клиентов** (20 наиболее частых вопросов и ситуаций)
   - Например: "настройка очков", "гарантия на оправу", "подбор линз при астигматизме"

2. **Артикулы и модели товаров** (все упоминавшиеся в диалогах)
   - Например: "Ray-Ban RB2132", "Essilor Varilux", "Zeiss DriveSafe"

Создай две отдельные колонки данных:
- Колонка A: Типичные проблемы (редактируемый список)
- Колонка B: Артикулы/модели (редактируемый список)

Далее генерируй тренировочные диалоги, комбинируя темы из обеих колонок:
- Каждый диалог должен быть уникальным
- Смешивай проблемы клиентов с конкретными моделями товаров
- Имитируй стиль общения из исходных 1700 диалогов
- Длина диалога: 3-8 реплик

Цель: обучить модель отвечать на вопросы про оптику естественно и с упоминанием конкретных товаров.`
  );

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
        body: JSON.stringify({ googleSheetsUrl, systemPrompt })
      });

      const result = await response.json();
      
      if (result.success) {
        setDialogsCount(result.dialogsCount);
        setExtractedProblems(result.problems || []);
        setExtractedProducts(result.products || []);
        setUploadStatus(`✓ Загружено ${result.dialogsCount} диалогов. Извлечено ${result.problems?.length || 0} проблем и ${result.products?.length || 0} товаров.`);
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

    try {
      const base64 = await fileToBase64(uploadedFile);
      
      const response = await fetch('https://functions.poehali.dev/d502ef50-1926-4db0-b56d-67f43e16998c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: base64,
          fileName: uploadedFile.name,
          systemPrompt
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setDialogsCount(result.dialogsCount);
        setExtractedProblems(result.problems || []);
        setExtractedProducts(result.products || []);
        setUploadStatus(`✓ Загружено ${result.dialogsCount} диалогов. Извлечено ${result.problems?.length || 0} проблем и ${result.products?.length || 0} товаров.`);
      } else {
        setUploadStatus(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus(`Ошибка загрузки файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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
            <Icon name="Sparkles" size={20} className="text-primary" />
            Системный промпт DeepSeek
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Инструкция для модели (как обрабатывать диалоги)
              </label>
              <Textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="bg-background/50 min-h-[280px] font-mono text-xs leading-relaxed"
                placeholder="Введите инструкцию для модели..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                Этот промпт объясняет DeepSeek, как извлекать знания из диалогов и создавать тренировочные данные
              </p>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  После обработки модель создаст 2 редактируемые колонки: "Типичные проблемы" и "Артикулы/модели товаров"
                </p>
              </div>
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

      {(extractedProblems.length > 0 || extractedProducts.length > 0) && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Icon name="Database" size={24} className="text-primary" />
            Извлечённые данные
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="AlertCircle" size={20} className="text-orange-500" />
                Типичные проблемы ({extractedProblems.length})
              </h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {extractedProblems.map((problem, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                    <span className="text-xs text-muted-foreground mt-1 flex-shrink-0">{idx + 1}.</span>
                    <Input 
                      defaultValue={problem}
                      className="flex-1 bg-transparent border-none text-sm p-0 h-auto"
                      onChange={(e) => {
                        const updated = [...extractedProblems];
                        updated[idx] = e.target.value;
                        setExtractedProblems(updated);
                      }}
                    />
                    <button 
                      onClick={() => setExtractedProblems(extractedProblems.filter((_, i) => i !== idx))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={16} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setExtractedProblems([...extractedProblems, ''])}
                variant="outline" 
                className="w-full mt-3"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить проблему
              </Button>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="Package" size={20} className="text-blue-500" />
                Артикулы / Модели ({extractedProducts.length})
              </h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {extractedProducts.map((product, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors">
                    <span className="text-xs text-muted-foreground mt-1 flex-shrink-0">{idx + 1}.</span>
                    <Input 
                      defaultValue={product}
                      className="flex-1 bg-transparent border-none text-sm p-0 h-auto"
                      onChange={(e) => {
                        const updated = [...extractedProducts];
                        updated[idx] = e.target.value;
                        setExtractedProducts(updated);
                      }}
                    />
                    <button 
                      onClick={() => setExtractedProducts(extractedProducts.filter((_, i) => i !== idx))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="X" size={16} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setExtractedProducts([...extractedProducts, ''])}
                variant="outline" 
                className="w-full mt-3"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить товар
              </Button>
            </Card>
          </div>

          <Card className="glass-card p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="Save" size={20} className="text-primary" />
                <div>
                  <p className="font-semibold text-sm">Сохранить изменения</p>
                  <p className="text-xs text-muted-foreground">Данные будут использованы для генерации тренировочных диалогов</p>
                </div>
              </div>
              <Button className="gradient-primary">
                <Icon name="Check" size={18} className="mr-2" />
                Применить
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;