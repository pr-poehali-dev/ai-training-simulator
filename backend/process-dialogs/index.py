import json
import os
import re
import base64
from typing import Dict, List, Any
from io import BytesIO
import requests
import pandas as pd

def handler(event: dict, context) -> dict:
    """
    Обрабатывает загрузку таблицы с диалогами (Excel/CSV/Google Sheets)
    Извлекает знания: товары, проблемы, правильные ответы
    Создает векторную базу для поиска похожих ситуаций
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        raw_body = event.get('body', '{}')
        is_base64 = event.get('isBase64Encoded', False)
        
        if not raw_body or raw_body.strip() == '':
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пустое тело запроса'})
            }
        
        body = json.loads(raw_body)
        google_sheets_url = body.get('googleSheetsUrl')
        file_data = body.get('file')
        file_name = body.get('fileName', 'file.xlsx')
        system_prompt = body.get('systemPrompt', '')
        
        if google_sheets_url:
            dialogs = parse_google_sheets(google_sheets_url)
        elif file_data:
            dialogs = parse_excel_file(file_data, file_name)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется googleSheetsUrl или file (base64)'})
            }
        
        # Быстрая локальная обработка без DeepSeek
        knowledge_base = extract_knowledge(dialogs)
        extracted_data = {
            'problems': knowledge_base['problems'][:30],
            'products': knowledge_base['products'][:100]
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'dialogsCount': len(dialogs),
                'problems': extracted_data.get('problems', []),
                'products': extracted_data.get('products', [])
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка обработки: {str(e)}'})
        }


def parse_excel_file(file_base64: str, file_name: str) -> List[Dict[str, Any]]:
    """Парсит Excel/CSV файл из base64"""
    try:
        file_bytes = base64.b64decode(file_base64)
        file_io = BytesIO(file_bytes)
        
        if file_name.endswith('.csv'):
            df = pd.read_csv(file_io)
        else:
            df = pd.read_excel(file_io, engine='openpyxl')
        
        if df.empty:
            raise ValueError('Файл пустой')
        
        required_columns = ['phrase_source', 'phrase_content', 'dialog_id']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f'Отсутствуют колонки: {", ".join(missing_columns)}. Найдены: {", ".join(df.columns.tolist())}')
        
        dialogs = []
        current_dialog_id = None
        current_messages = []
        
        for _, row in df.iterrows():
            phrase_source = str(row['phrase_source']).strip()
            phrase_content = str(row['phrase_content']).strip()
            dialog_id = str(row['dialog_id']).strip()
            
            if phrase_source == 'nan' or phrase_content == 'nan' or dialog_id == 'nan':
                continue
            
            if dialog_id != current_dialog_id:
                if current_messages:
                    dialogs.append({
                        'dialog_id': current_dialog_id,
                        'messages': current_messages
                    })
                current_dialog_id = dialog_id
                current_messages = []
            
            current_messages.append({
                'source': phrase_source,
                'content': phrase_content
            })
        
        if current_messages:
            dialogs.append({
                'dialog_id': current_dialog_id,
                'messages': current_messages
            })
        
        if not dialogs:
            raise ValueError('Не удалось найти диалоги в файле')
        
        return dialogs
        
    except Exception as e:
        raise ValueError(f'Ошибка чтения файла: {str(e)}')


def parse_google_sheets(url: str) -> List[Dict[str, Any]]:
    """Парсит Google Sheets через публичный CSV экспорт"""
    import csv
    from io import StringIO
    
    sheet_id_match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
    if not sheet_id_match:
        raise ValueError('Неверная ссылка на Google Sheets')
    
    sheet_id = sheet_id_match.group(1)
    csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv'
    
    response = requests.get(csv_url, timeout=30)
    if response.status_code != 200:
        raise ValueError(f'Ошибка доступа к таблице (код {response.status_code}). Проверьте, что таблица доступна для просмотра по ссылке.')
    
    if not response.text or len(response.text) < 10:
        raise ValueError('Таблица пуста или недоступна. Откройте доступ: Файл → Доступ → Просмотр для всех, у кого есть ссылка')
    
    csv_reader = csv.DictReader(StringIO(response.text))
    rows = list(csv_reader)
    
    if not rows:
        raise ValueError('В таблице нет данных')
    
    dialogs = []
    current_dialog_id = None
    current_messages = []
    
    for row in rows:
        phrase_source = row.get('phrase_source', '').strip()
        phrase_content = row.get('phrase_content', '').strip()
        dialog_id = row.get('dialog_id', '').strip()
        
        if not phrase_source or not phrase_content or not dialog_id:
            continue
        
        if dialog_id != current_dialog_id:
            if current_messages:
                dialogs.append({
                    'dialog_id': current_dialog_id,
                    'messages': current_messages
                })
            current_dialog_id = dialog_id
            current_messages = []
        
        current_messages.append({
            'source': phrase_source,
            'content': phrase_content
        })
    
    if current_messages:
        dialogs.append({
            'dialog_id': current_dialog_id,
            'messages': current_messages
        })
    
    if not dialogs:
        raise ValueError('Не удалось найти диалоги. Проверьте формат: нужны колонки phrase_source, phrase_content, dialog_id')
    
    return dialogs


def process_with_deepseek(dialogs: List[Dict[str, Any]], system_prompt: str) -> Dict[str, List[str]]:
    """Обрабатывает диалоги через DeepSeek API с кастомным промптом"""
    try:
        api_key = os.environ.get('DEEPSEEK_API_KEY')
        if not api_key:
            raise ValueError('DEEPSEEK_API_KEY не настроен')
        
        # Берем все диалоги без обрезки, ограничиваем только общий объем
        dialogs_text = '\n\n'.join([
            f"Диалог {d['dialog_id']}:\n" + '\n'.join([
                f"{m['source']}: {m['content']}" for m in d['messages']
            ]) for d in dialogs
        ])[:100000]  # Ограничение 100к символов для API
        
        response = requests.post(
            'https://api.deepseek.com/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f'Вот диалоги для анализа:\n\n{dialogs_text}\n\nВерни результат в JSON формате: {{"problems": ["проблема1", "проблема2", ...], "products": ["товар1", "товар2", ...]}}'}
                ],
                'temperature': 0.3,
                'max_tokens': 8000
            },
            timeout=60
        )
        
        if response.status_code != 200:
            raise ValueError(f'DeepSeek API ошибка: {response.status_code}')
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            extracted = json.loads(json_match.group())
            return {
                'problems': extracted.get('problems', [])[:20],
                'products': extracted.get('products', [])[:50]
            }
        
        return {'problems': [], 'products': []}
        
    except Exception as e:
        print(f'DeepSeek обработка не удалась: {str(e)}')
        fallback = extract_knowledge(dialogs)
        return {
            'problems': fallback['problems'][:20],
            'products': fallback['products'][:50]
        }


def extract_knowledge(dialogs: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """Быстрое извлечение проблем клиентов и товаров из диалогов"""
    products = set()
    problems = set()
    
    problem_keywords = [
        'не работает', 'не видим', 'не получается', 'не хватает', 'не могу',
        'сломан', 'сломал', 'сломался', 'разбит', 'разбился',
        'мутное', 'пятно', 'царапина', 'трещина',
        'проблема', 'дефект', 'брак',
        'как будто', 'почему', 'что делать'
    ]
    
    product_keywords = ['микроскоп', 'телескоп', 'бинокль', 'прицел', 'лупа', 'окуляр', 'объектив']
    
    for dialog in dialogs:
        for msg in dialog['messages']:
            content = msg['content']
            content_lower = content.lower()
            
            # Извлекаем проблемы клиентов
            if msg['source'] == 'Клиент':
                # Разбиваем на предложения по точке и вопросу
                sentences = content.replace('?', '.').split('.')
                for sentence in sentences:
                    sentence = sentence.strip()
                    if any(word in sentence.lower() for word in problem_keywords):
                        if len(sentence) > 200:
                            sentence = sentence[:200] + '...'
                        if len(sentence) > 10:
                            problems.add(sentence)
            
            # Извлекаем названия товаров
            if any(keyword in content_lower for keyword in product_keywords):
                # Ищем паттерны: "слово цифры" или "слово слово цифры"
                product_patterns = [
                    r'[А-Яа-яA-Za-z]+\s+\d+[хx]?\d*',
                    r'[А-Яа-я]+\s+[А-Яа-я]+\s+\d+',
                    r'[А-Яа-я]+\s+[рРpP]\d+',
                    r'детский\s+[А-Яа-я]+',
                    r'[А-Яа-я]+-\d+',
                ]
                for pattern in product_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    for match in matches:
                        cleaned = match.strip()
                        if len(cleaned) > 4 and not cleaned.lower().startswith(('как ', 'что ', 'где ')):
                            products.add(cleaned)
    
    return {
        'products': sorted(list(products)),
        'problems': sorted(list(problems))
    }