# Plano de Implementação Detalhado do FullVideoEditAPI

## 1. Visão Geral da Implementação

Este documento detalha o plano de implementação do FullVideoEditAPI, considerando as especificações de implantação em VPS Ubuntu com EasyPanel, uso inicial pessoal e futura monetização. O plano abrange desde a configuração do ambiente de desenvolvimento até a implantação em produção.

## 2. Arquitetura de Implantação

### 2.1. Ambiente de Produção (VPS Ubuntu + EasyPanel)

**Infraestrutura:**
- **VPS**: Hostinger (ou provedor similar) com Ubuntu 22.04 LTS
- **Orquestração**: EasyPanel para gerenciamento de containers Docker
- **N8n**: Container existente no EasyPanel
- **Armazenamento**: Minio (auto-hospedado) ou Cloudflare R2 para armazenamento de vídeos

**Containers Docker:**
1. **FullVideoEditAPI**: Container principal da API (FastAPI/Python)
2. **Redis**: Fila de mensagens e cache
3. **Worker**: Container para processamento de vídeo (Celery workers)
4. **Minio** (opcional): Armazenamento S3-compatível auto-hospedado
5. **PostgreSQL**: Banco de dados para metadados e usuários (futura monetização)

### 2.2. Rede e Comunicação

- **Comunicação Interna**: Rede Docker interna entre containers
- **Comunicação Externa**: API exposta via proxy reverso do EasyPanel
- **N8n Integration**: Comunicação via HTTP entre o nó n8n e a FullVideoEditAPI

## 3. Stack Tecnológica Definida

### 3.1. Backend API
- **Linguagem**: Python 3.11+
- **Framework**: FastAPI (alta performance, documentação automática)
- **Processamento de Vídeo**: MoviePy + FFmpeg
- **Fila de Mensagens**: Celery + Redis
- **Banco de Dados**: PostgreSQL (para metadados e futura monetização)
- **Armazenamento**: Minio (auto-hospedado) ou Cloudflare R2

### 3.2. Nó de Comunidade n8n
- **Linguagem**: TypeScript
- **Framework**: Padrão n8n community node

### 3.3. Aplicação Web (Futura)
- **Frontend**: React.js ou Vue.js
- **Backend**: FastAPI (mesmo da API principal)
- **Autenticação**: JWT tokens
- **Pagamentos**: Stripe (para monetização)

## 4. Estrutura de Diretórios do Projeto

```
fullvideoeditapi/
├── api/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── worker/
│   ├── worker.py
│   ├── tasks/
│   ├── requirements.txt
│   └── Dockerfile
├── n8n-node/
│   ├── credentials/
│   ├── nodes/
│   ├── package.json
│   └── tsconfig.json
├── web-app/ (futura)
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

## 5. Configuração do Ambiente de Desenvolvimento

### 5.1. Pré-requisitos
- Python 3.11+
- Docker e Docker Compose
- Node.js 18+ (para o nó n8n)
- FFmpeg instalado no sistema

### 5.2. Variáveis de Ambiente

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/fullvideoeditapi

# Redis
REDIS_URL=redis://redis:6379/0

# Storage (Minio)
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=videos

# Storage (Cloudflare R2 - alternativa)
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET_NAME=videos

# FFmpeg
FFMPEG_PATH=/usr/bin/ffmpeg

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

## 6. Implementação da API Principal

### 6.1. Estrutura da API FastAPI

**main.py:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import video_generation, health
from app.config import settings

app = FastAPI(
    title="FullVideoEditAPI",
    description="API para edição de vídeo com templates dinâmicos",
    version="1.0.0"
)

# CORS para permitir acesso do n8n
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(video_generation.router, prefix="/api/v1", tags=["video"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 6.2. Endpoint Principal de Geração de Vídeo

**routers/video_generation.py:**
```python
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.video_service import VideoGenerationService
from app.models.video_request import VideoGenerationRequest

router = APIRouter()

@router.post("/generate-video")
async def generate_video(
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks
):
    try:
        service = VideoGenerationService()
        job_id = await service.create_video_generation_job(request)
        
        return {
            "status": "processing",
            "jobId": job_id,
            "message": "Video generation started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/job/{job_id}/status")
async def get_job_status(job_id: str):
    service = VideoGenerationService()
    status = await service.get_job_status(job_id)
    return status
```

### 6.3. Modelos de Dados

**models/video_request.py:**
```python
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any

class VideoUrl(BaseModel):
    url: HttpUrl
    startTime: Optional[float] = 0
    endTime: Optional[float] = 0

class AudioUrl(BaseModel):
    url: HttpUrl
    volume: Optional[float] = 1.0
    loop: Optional[bool] = False

class TextOverlay(BaseModel):
    text: str
    font: Optional[str] = "Arial"
    color: Optional[str] = "#FFFFFF"
    positionX: Optional[float] = 50
    positionY: Optional[float] = 50
    startTime: Optional[float] = 0
    endTime: Optional[float] = 0
    animation: Optional[str] = "none"

class OutputSettings(BaseModel):
    format: Optional[str] = "mp4"
    resolution: Optional[str] = "1920x1080"

class VideoGenerationRequest(BaseModel):
    videoUrls: List[VideoUrl]
    audioUrls: Optional[List[AudioUrl]] = []
    textOverlays: Optional[List[TextOverlay]] = []
    templateStructure: Optional[Dict[str, Any]] = {}
    outputSettings: Optional[OutputSettings] = OutputSettings()
    webhookUrl: Optional[HttpUrl] = None
```

## 7. Sistema de Processamento Assíncrono

### 7.1. Configuração do Celery

**worker/worker.py:**
```python
from celery import Celery
from app.config import settings

celery_app = Celery(
    "video_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["worker.tasks.video_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
```

### 7.2. Tasks de Processamento de Vídeo

**worker/tasks/video_tasks.py:**
```python
from celery import current_task
from worker.worker import celery_app
from moviepy.editor import VideoFileClip, CompositeVideoClip, TextClip
import requests
import tempfile
import os

@celery_app.task(bind=True)
def process_video_generation(self, job_data):
    try:
        # Update task status
        current_task.update_state(
            state="PROCESSING",
            meta={"status": "Downloading video files..."}
        )
        
        # Download video files
        video_clips = []
        for video_url in job_data["videoUrls"]:
            clip = download_and_process_video(video_url)
            video_clips.append(clip)
        
        # Process audio
        current_task.update_state(
            state="PROCESSING",
            meta={"status": "Processing audio..."}
        )
        
        # Add text overlays
        current_task.update_state(
            state="PROCESSING",
            meta={"status": "Adding text overlays..."}
        )
        
        # Compose final video
        final_video = compose_video(video_clips, job_data)
        
        # Upload to storage
        current_task.update_state(
            state="PROCESSING",
            meta={"status": "Uploading final video..."}
        )
        
        video_url = upload_to_storage(final_video)
        
        # Send webhook if provided
        if job_data.get("webhookUrl"):
            send_webhook_notification(job_data["webhookUrl"], {
                "jobId": self.request.id,
                "status": "completed",
                "videoUrl": video_url
            })
        
        return {
            "status": "completed",
            "videoUrl": video_url,
            "jobId": self.request.id
        }
        
    except Exception as e:
        current_task.update_state(
            state="FAILURE",
            meta={"status": "failed", "error": str(e)}
        )
        raise
```

## 8. Configuração do Docker

### 8.1. Dockerfile da API

**api/Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 8.2. Docker Compose para Produção

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/fullvideoeditapi
      - REDIS_URL=redis://redis:6379/0
      - MINIO_ENDPOINT=minio:9000
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./temp:/tmp

  worker:
    build: ./worker
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - redis
      - minio
    volumes:
      - ./temp:/tmp

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=fullvideoeditapi
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

## 9. Implantação no EasyPanel

### 9.1. Configuração no EasyPanel

1. **Criar novo projeto** no EasyPanel
2. **Configurar variáveis de ambiente** através da interface do EasyPanel
3. **Deploy via Docker Compose** usando o arquivo `docker-compose.prod.yml`
4. **Configurar proxy reverso** para expor a API externamente
5. **Configurar SSL/TLS** através do EasyPanel

### 9.2. Configuração de Rede

- **API**: Exposta na porta 8000, acessível via proxy reverso
- **Minio**: Interface web na porta 9001 (opcional, para administração)
- **N8n**: Container existente, comunicação via rede interna do Docker

## 10. Integração com N8n Existente

### 10.1. Configuração de Rede

O nó n8n precisará acessar a FullVideoEditAPI através da rede interna do Docker ou via URL externa, dependendo da configuração do EasyPanel.

### 10.2. Credenciais no N8n

Configurar as credenciais do nó n8n com:
- **API Base URL**: `http://fullvideoeditapi:8000` (rede interna) ou `https://your-domain.com/api` (externa)
- **API Key**: Chave gerada pela FullVideoEditAPI

## 11. Monitoramento e Logs

### 11.1. Logging

- **Estruturado**: Logs em formato JSON para facilitar análise
- **Níveis**: DEBUG, INFO, WARNING, ERROR
- **Destinos**: Console (capturado pelo Docker) e arquivos de log

### 11.2. Métricas

- **Health checks**: Endpoint `/health` para verificação de status
- **Métricas de performance**: Tempo de processamento, uso de recursos
- **Monitoramento de filas**: Status das tasks do Celery

## 12. Segurança

### 12.1. Autenticação da API

- **API Keys**: Sistema de chaves de API para autenticação
- **Rate Limiting**: Limitação de requisições por IP/usuário
- **CORS**: Configurado para permitir acesso do n8n

### 12.2. Segurança de Arquivos

- **Validação**: Verificação de tipos de arquivo e tamanhos
- **Sanitização**: Limpeza de nomes de arquivo e paths
- **Isolamento**: Processamento em containers isolados

## 13. Backup e Recuperação

### 13.1. Backup de Dados

- **PostgreSQL**: Backup automático diário
- **Minio**: Backup dos vídeos gerados (opcional, dependendo da política de retenção)
- **Configurações**: Backup das configurações do EasyPanel

### 13.2. Estratégia de Recuperação

- **RTO**: Recovery Time Objective de 4 horas
- **RPO**: Recovery Point Objective de 24 horas
- **Procedimentos**: Documentados e testados regularmente

## 14. Próximos Passos

1. **Configurar ambiente de desenvolvimento** local
2. **Implementar API básica** com endpoint de geração de vídeo
3. **Configurar sistema de filas** com Celery e Redis
4. **Implementar processamento de vídeo** com MoviePy
5. **Configurar armazenamento** com Minio
6. **Desenvolver nó n8n** em paralelo
7. **Testes de integração** entre todos os componentes
8. **Preparar containers Docker** para produção
9. **Deploy no EasyPanel** e testes finais
10. **Documentação** e entrega

Este plano de implementação fornece uma base sólida para o desenvolvimento do FullVideoEditAPI, considerando as especificações de implantação e a visão de crescimento do projeto.

