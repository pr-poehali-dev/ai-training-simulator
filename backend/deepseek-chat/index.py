import json
import os
import requests

def handler(event: dict, context) -> dict:
    """
    DeepSeek API интеграция для чата (работает без VPN из России)
    Использует официальный API DeepSeek: https://api.deepseek.com
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
        messages = body.get('messages', [])
        model = body.get('model', 'deepseek-chat')
        temperature = body.get('temperature', 0.8)
        max_tokens = body.get('max_tokens', 500)
        
        if not messages:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'messages required'})
            }
        
        api_key = os.environ.get('DEEPSEEK_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DEEPSEEK_API_KEY not configured'})
            }
        
        response = requests.post(
            'https://api.deepseek.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model,
                'messages': messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            },
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        
        content = result['choices'][0]['message']['content']
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'content': content,
                'model': model,
                'usage': result.get('usage', {})
            }, ensure_ascii=False)
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'DeepSeek API error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Internal error: {str(e)}'})
        }
