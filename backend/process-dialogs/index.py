import json
import os
import re
from typing import Dict, List, Any
import requests

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
        body = json.loads(event.get('body', '{}'))
        google_sheets_url = body.get('googleSheetsUrl')
        
        if google_sheets_url:
            dialogs = parse_google_sheets(google_sheets_url)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Требуется googleSheetsUrl или файл'})
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


def parse_google_sheets(url: str) -> List[Dict[str, Any]]:
    """Парсит Google Sheets через публичный CSV экспорт"""
    sheet_id_match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
    if not sheet_id_match:
        raise ValueError('Неверная ссылка на Google Sheets')
    
    sheet_id = sheet_id_match.group(1)
    csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv'
    
    response = requests.get(csv_url, timeout=30)
    response.raise_for_status()
    
    lines = response.text.strip().split('\n')
    if len(lines) < 2:
        raise ValueError('Таблица пуста')
    
    headers = [h.strip() for h in lines[0].split(',')]
    
    dialogs = []
    current_dialog_id = None
    current_messages = []
    
    for line in lines[1:]:
        parts = line.split(',')
        if len(parts) < 3:
            continue
            
        phrase_source = parts[0].strip().strip('"')
        phrase_content = ','.join(parts[1:-2]).strip().strip('"')
        dialog_id = parts[-2].strip().strip('"')
        
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
