from celery import Celery
import os
import time
import requests

# Usaremos Redis como broker e result backend
# Certifique-se de que o Redis está rodando na sua VPS
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "video_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name='worker.worker.process_video_generation_task')
def process_video_generation_task(request_data: dict):
    """
    Simula o processamento de vídeo.
    Em uma implementação real, aqui entraria a lógica com MoviePy/FFmpeg.
    """
    print(f"Iniciando processamento para o job...")
    
    # Simula um processo de renderização longo
    time.sleep(15) 
    
    print("Processamento finalizado.")
    
    # Simula o resultado
    result = {
        "status": "completed",
        "videoUrl": "https://example.com/path/to/generated/video.mp4",
    }

    # Se uma URL de webhook foi fornecida, envia a notificação
    webhook_url = request_data.get("webhookUrl")
    if webhook_url:
        try:
            print(f"Enviando notificação de webhook para: {webhook_url}")
            requests.post(webhook_url, json=result)
        except requests.exceptions.RequestException as e:
            print(f"Erro ao enviar webhook: {e}")
            # Em um cenário real, você poderia tentar novamente ou logar o erro
            
    return result
