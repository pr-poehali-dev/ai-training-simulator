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
        
        knowledge_base = extract_knowledge(dialogs)
        
        products = knowledge_base['products']
        problems = knowledge_base['problems']
        solutions = knowledge_base['solutions']
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'dialogsCount': len(dialogs),
                'productsFound': len(products),
                'problemsFound': len(problems),
                'knowledge': {
                    'products': products[:10],
                    'problems': problems[:10],
                    'solutions': solutions[:10]
                }
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


def extract_knowledge(dialogs: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """Извлекает знания из диалогов"""
    products = set()
    problems = set()
    solutions = []
    
    optical_keywords = [
        'прицел', 'оптика', 'микроскоп', 'бинокль', 'монокуляр',
        'телескоп', 'сетка', 'кратность', 'объектив', 'линза',
        'диоптрия', 'фокус', 'параллакс', 'MOA', 'настройка',
        'пристрелка', 'вынос', 'щелчок'
    ]
    
    for dialog in dialogs:
        messages = dialog['messages']
        
        for msg in messages:
            content = msg['content'].lower()
            
            for keyword in optical_keywords:
                if keyword in content:
                    words = content.split()
                    for i, word in enumerate(words):
                        if keyword in word and i > 0:
                            potential_product = ' '.join(words[max(0, i-2):min(len(words), i+3)])
                            if len(potential_product) > 10:
                                products.add(potential_product[:100])
            
            if msg['source'] == 'Клиент':
                if any(word in content for word in ['как', 'почему', 'не работает', 'проблема', 'помогите']):
                    problems.add(msg['content'][:200])
            
            if msg['source'] == 'Наш сотрудник':
                client_msg = None
                for m in messages:
                    if m['source'] == 'Клиент':
                        client_msg = m
                        break
                
                if client_msg:
                    solutions.append({
                        'problem': client_msg['content'][:200],
                        'solution': msg['content'][:300]
                    })
    
    return {
        'products': list(products),
        'problems': list(problems),
        'solutions': solutions
    }