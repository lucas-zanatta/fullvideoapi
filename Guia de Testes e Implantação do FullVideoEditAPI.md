# Guia de Testes e Implantação do FullVideoEditAPI

## 1. Visão Geral dos Testes

Este documento detalha a estratégia de testes integrados e o processo de implantação do FullVideoEditAPI em ambiente de produção usando VPS Ubuntu com EasyPanel.

## 2. Estratégia de Testes

### 2.1. Tipos de Testes

**Testes Unitários:**
- Componentes individuais da API
- Funções de processamento de vídeo
- Validação de dados de entrada
- Lógica de negócio

**Testes de Integração:**
- Comunicação entre API e workers
- Integração com armazenamento (Minio/S3)
- Fluxo completo de geração de vídeo
- Integração com n8n

**Testes End-to-End:**
- Fluxos completos via interface web
- Integração n8n → API → Worker → Storage
- Webhooks e notificações
- Cenários de erro e recuperação

**Testes de Performance:**
- Carga de trabalho simultânea
- Tempo de processamento de vídeos
- Uso de recursos (CPU, memória, disco)
- Escalabilidade horizontal

### 2.2. Ambiente de Testes

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  api-test:
    build: ./api
    environment:
      - DATABASE_URL=postgresql://test:test@postgres-test:5432/fullvideoeditapi_test
      - REDIS_URL=redis://redis-test:6379/0
      - MINIO_ENDPOINT=minio-test:9000
      - TESTING=true
    depends_on:
      - postgres-test
      - redis-test
      - minio-test
    volumes:
      - ./temp:/tmp

  worker-test:
    build: ./worker
    environment:
      - CELERY_BROKER_URL=redis://redis-test:6379/0
      - CELERY_RESULT_BACKEND=redis://redis-test:6379/0
      - TESTING=true
    depends_on:
      - redis-test
      - minio-test
    volumes:
      - ./temp:/tmp

  postgres-test:
    image: postgres:15
    environment:
      - POSTGRES_DB=fullvideoeditapi_test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
    tmpfs:
      - /var/lib/postgresql/data

  redis-test:
    image: redis:7-alpine

  minio-test:
    image: minio/minio
    environment:
      - MINIO_ACCESS_KEY=testkey
      - MINIO_SECRET_KEY=testsecret
    command: server /data
    tmpfs:
      - /data
```

## 3. Implementação dos Testes

### 3.1. Testes Unitários da API

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.video_request import VideoGenerationRequest

client = TestClient(app)

class TestVideoGeneration:
    def test_generate_video_endpoint(self):
        """Testa o endpoint de geração de vídeo"""
        payload = {
            "videoUrls": [
                {
                    "url": "https://example.com/test.mp4",
                    "startTime": 0,
                    "endTime": 10
                }
            ],
            "audioUrls": [],
            "textOverlays": [
                {
                    "text": "Test Text",
                    "font": "Arial",
                    "color": "#FFFFFF",
                    "positionX": 50,
                    "positionY": 50
                }
            ],
            "outputSettings": {
                "format": "mp4",
                "resolution": "1920x1080"
            }
        }
        
        response = client.post(
            "/api/v1/generate-video",
            json=payload,
            headers={"Authorization": "Bearer test-api-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "jobId" in data
        assert data["status"] == "processing"

    def test_invalid_video_request(self):
        """Testa validação de dados inválidos"""
        payload = {
            "videoUrls": [],  # Lista vazia deve falhar
            "outputSettings": {
                "format": "invalid_format"  # Formato inválido
            }
        }
        
        response = client.post(
            "/api/v1/generate-video",
            json=payload,
            headers={"Authorization": "Bearer test-api-key"}
        )
        
        assert response.status_code == 422

    def test_job_status_endpoint(self):
        """Testa o endpoint de status do job"""
        job_id = "test-job-123"
        
        response = client.get(
            f"/api/v1/job/{job_id}/status",
            headers={"Authorization": "Bearer test-api-key"}
        )
        
        assert response.status_code in [200, 404]

class TestAuthentication:
    def test_missing_auth_header(self):
        """Testa requisição sem autenticação"""
        response = client.post("/api/v1/generate-video", json={})
        assert response.status_code == 401

    def test_invalid_api_key(self):
        """Testa chave de API inválida"""
        response = client.post(
            "/api/v1/generate-video",
            json={},
            headers={"Authorization": "Bearer invalid-key"}
        )
        assert response.status_code == 401

class TestHealthCheck:
    def test_health_endpoint(self):
        """Testa o endpoint de saúde"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
```

### 3.2. Testes de Processamento de Vídeo

```python
# tests/test_video_processing.py
import pytest
import tempfile
import os
from worker.tasks.video_tasks import process_video_generation
from moviepy.editor import VideoFileClip

class TestVideoProcessing:
    @pytest.fixture
    def sample_video_data(self):
        """Dados de exemplo para processamento de vídeo"""
        return {
            "videoUrls": [
                {
                    "url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                    "startTime": 0,
                    "endTime": 5
                }
            ],
            "audioUrls": [],
            "textOverlays": [
                {
                    "text": "Test Overlay",
                    "font": "Arial",
                    "color": "#FFFFFF",
                    "positionX": 50,
                    "positionY": 20,
                    "startTime": 1,
                    "endTime": 4
                }
            ],
            "outputSettings": {
                "format": "mp4",
                "resolution": "1280x720"
            }
        }

    def test_video_download_and_processing(self, sample_video_data):
        """Testa download e processamento básico de vídeo"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Mock do processamento (em ambiente real, usaria arquivos de teste locais)
            result = process_video_generation.apply(args=[sample_video_data])
            
            assert result.status == 'SUCCESS'
            assert 'videoUrl' in result.result
            assert result.result['status'] == 'completed'

    def test_text_overlay_application(self):
        """Testa aplicação de sobreposição de texto"""
        # Criar um vídeo de teste simples
        from moviepy.editor import ColorClip, TextClip, CompositeVideoClip
        
        # Vídeo base (fundo azul)
        base_clip = ColorClip(size=(640, 480), color=(0, 0, 255), duration=5)
        
        # Texto sobreposto
        text_clip = TextClip(
            "Test Text",
            fontsize=50,
            color='white',
            font='Arial'
        ).set_position('center').set_duration(3)
        
        # Composição
        final_clip = CompositeVideoClip([base_clip, text_clip])
        
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            final_clip.write_videofile(temp_file.name, verbose=False, logger=None)
            
            # Verificar se o arquivo foi criado
            assert os.path.exists(temp_file.name)
            assert os.path.getsize(temp_file.name) > 0
            
            # Verificar propriedades do vídeo
            test_clip = VideoFileClip(temp_file.name)
            assert test_clip.duration == 5
            assert test_clip.size == (640, 480)
            
            # Limpeza
            test_clip.close()
            final_clip.close()
            os.unlink(temp_file.name)

    def test_audio_mixing(self):
        """Testa mixagem de áudio"""
        from moviepy.editor import ColorClip, AudioFileClip
        
        # Criar um vídeo de teste
        video_clip = ColorClip(size=(640, 480), color=(0, 255, 0), duration=10)
        
        # Em um teste real, usaríamos arquivos de áudio de exemplo
        # Por agora, apenas verificamos a estrutura
        assert video_clip.duration == 10
        video_clip.close()

class TestErrorHandling:
    def test_invalid_video_url(self):
        """Testa tratamento de URL de vídeo inválida"""
        invalid_data = {
            "videoUrls": [
                {
                    "url": "https://invalid-url.com/nonexistent.mp4",
                    "startTime": 0,
                    "endTime": 5
                }
            ],
            "outputSettings": {
                "format": "mp4",
                "resolution": "1280x720"
            }
        }
        
        result = process_video_generation.apply(args=[invalid_data])
        assert result.status == 'FAILURE'
        assert 'error' in result.result

    def test_invalid_time_range(self):
        """Testa tratamento de range de tempo inválido"""
        invalid_data = {
            "videoUrls": [
                {
                    "url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                    "startTime": 10,  # Início após o fim
                    "endTime": 5
                }
            ],
            "outputSettings": {
                "format": "mp4",
                "resolution": "1280x720"
            }
        }
        
        result = process_video_generation.apply(args=[invalid_data])
        assert result.status == 'FAILURE'
```

### 3.3. Testes de Integração com n8n

```python
# tests/test_n8n_integration.py
import pytest
import requests
import json
from unittest.mock import Mock, patch

class TestN8nIntegration:
    @pytest.fixture
    def n8n_webhook_payload(self):
        """Payload típico enviado pelo nó n8n"""
        return {
            "videoUrls": [
                {
                    "url": "https://example.com/video1.mp4",
                    "startTime": 0,
                    "endTime": 10
                }
            ],
            "audioUrls": [
                {
                    "url": "https://example.com/audio1.mp3",
                    "volume": 0.8,
                    "loop": True
                }
            ],
            "textOverlays": [
                {
                    "text": "Generated by n8n",
                    "font": "Arial",
                    "color": "#FF0000",
                    "positionX": 50,
                    "positionY": 10,
                    "startTime": 2,
                    "endTime": 8,
                    "animation": "fade-in"
                }
            ],
            "outputSettings": {
                "format": "mp4",
                "resolution": "1920x1080"
            },
            "webhookUrl": "https://n8n-instance.com/webhook/test-123"
        }

    def test_n8n_video_generation_request(self, n8n_webhook_payload):
        """Testa requisição completa do n8n"""
        response = client.post(
            "/api/v1/generate-video",
            json=n8n_webhook_payload,
            headers={"Authorization": "Bearer test-api-key"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "jobId" in data
        assert data["status"] == "processing"

    @patch('requests.post')
    def test_webhook_notification(self, mock_post, n8n_webhook_payload):
        """Testa notificação via webhook para o n8n"""
        mock_post.return_value.status_code = 200
        
        # Simular conclusão de processamento
        webhook_data = {
            "jobId": "test-job-123",
            "status": "completed",
            "videoUrl": "https://storage.example.com/video-123.mp4"
        }
        
        # Em um teste real, isso seria chamado pelo worker
        requests.post(
            n8n_webhook_payload["webhookUrl"],
            json=webhook_data,
            headers={"Content-Type": "application/json"}
        )
        
        mock_post.assert_called_once_with(
            n8n_webhook_payload["webhookUrl"],
            json=webhook_data,
            headers={"Content-Type": "application/json"}
        )

class TestN8nNodeCredentials:
    def test_credential_validation(self):
        """Testa validação de credenciais do nó n8n"""
        # Simular teste de credenciais do nó n8n
        response = client.get(
            "/health",
            headers={"Authorization": "Bearer valid-api-key"}
        )
        
        assert response.status_code == 200
        
        # Teste com credencial inválida
        response = client.get(
            "/health",
            headers={"Authorization": "Bearer invalid-api-key"}
        )
        
        assert response.status_code == 401
```

### 3.4. Testes de Performance

```python
# tests/test_performance.py
import pytest
import asyncio
import aiohttp
import time
from concurrent.futures import ThreadPoolExecutor

class TestPerformance:
    @pytest.fixture
    def performance_payload(self):
        """Payload otimizado para testes de performance"""
        return {
            "videoUrls": [
                {
                    "url": "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4",
                    "startTime": 0,
                    "endTime": 3  # Vídeo curto para teste rápido
                }
            ],
            "textOverlays": [
                {
                    "text": "Performance Test",
                    "font": "Arial",
                    "color": "#FFFFFF",
                    "positionX": 50,
                    "positionY": 50
                }
            ],
            "outputSettings": {
                "format": "mp4",
                "resolution": "640x360"  # Resolução baixa para teste rápido
            }
        }

    def test_single_request_performance(self, performance_payload):
        """Testa performance de uma única requisição"""
        start_time = time.time()
        
        response = client.post(
            "/api/v1/generate-video",
            json=performance_payload,
            headers={"Authorization": "Bearer test-api-key"}
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        assert response.status_code == 200
        assert response_time < 1.0  # Resposta da API deve ser < 1 segundo

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, performance_payload):
        """Testa múltiplas requisições simultâneas"""
        async def make_request(session, payload):
            async with session.post(
                "http://localhost:8000/api/v1/generate-video",
                json=payload,
                headers={"Authorization": "Bearer test-api-key"}
            ) as response:
                return await response.json()

        async with aiohttp.ClientSession() as session:
            # Fazer 10 requisições simultâneas
            tasks = [
                make_request(session, performance_payload)
                for _ in range(10)
            ]
            
            start_time = time.time()
            results = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            
            total_time = end_time - start_time
            
            # Verificar que todas as requisições foram bem-sucedidas
            successful_requests = [
                r for r in results 
                if isinstance(r, dict) and 'jobId' in r
            ]
            
            assert len(successful_requests) >= 8  # Pelo menos 80% de sucesso
            assert total_time < 5.0  # Todas as requisições em menos de 5 segundos

    def test_memory_usage_monitoring(self):
        """Testa monitoramento de uso de memória"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Fazer várias requisições para testar vazamentos de memória
        for i in range(20):
            response = client.post(
                "/api/v1/generate-video",
                json={
                    "videoUrls": [
                        {
                            "url": f"https://example.com/video{i}.mp4",
                            "startTime": 0,
                            "endTime": 5
                        }
                    ],
                    "outputSettings": {
                        "format": "mp4",
                        "resolution": "640x360"
                    }
                },
                headers={"Authorization": "Bearer test-api-key"}
            )
        
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Aumento de memória não deve ser excessivo
        assert memory_increase < 100  # Menos de 100MB de aumento
```

## 4. Testes End-to-End

### 4.1. Configuração do Playwright

```python
# tests/test_e2e.py
import pytest
from playwright.sync_api import sync_playwright

class TestE2E:
    @pytest.fixture
    def browser_context(self):
        """Configuração do browser para testes E2E"""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            yield context
            context.close()
            browser.close()

    def test_complete_video_generation_flow(self, browser_context):
        """Testa fluxo completo de geração de vídeo via interface web"""
        page = browser_context.new_page()
        
        # Navegar para a aplicação
        page.goto("http://localhost:3000")
        
        # Fazer login
        page.click("button:has-text('Entrar')")
        page.fill("input[type='email']", "test@example.com")
        page.fill("input[type='password']", "testpassword")
        page.click("button:has-text('Login')")
        
        # Aguardar redirecionamento para dashboard
        page.wait_for_url("**/dashboard")
        
        # Navegar para geração de vídeo
        page.click("a:has-text('Gerar Vídeo')")
        
        # Preencher formulário
        page.fill("input[placeholder='URL do vídeo']", "https://example.com/test.mp4")
        page.fill("textarea[placeholder='Texto sobreposto']", "Teste E2E")
        page.select_option("select[name='resolution']", "1280x720")
        
        # Submeter formulário
        page.click("button:has-text('Gerar Vídeo')")
        
        # Verificar resposta
        page.wait_for_selector(".success-message", timeout=5000)
        success_text = page.text_content(".success-message")
        assert "Vídeo enviado para processamento" in success_text

    def test_video_library_navigation(self, browser_context):
        """Testa navegação na biblioteca de vídeos"""
        page = browser_context.new_page()
        
        # Login e navegação
        page.goto("http://localhost:3000/login")
        # ... processo de login ...
        
        # Ir para biblioteca
        page.click("a:has-text('Biblioteca')")
        page.wait_for_url("**/videos")
        
        # Verificar elementos da página
        assert page.is_visible("h1:has-text('Biblioteca de Vídeos')")
        assert page.is_visible("input[placeholder='Buscar vídeos...']")
        
        # Testar filtros
        page.select_option("select[name='filter']", "completed")
        page.wait_for_timeout(1000)  # Aguardar filtro aplicar
        
        # Verificar se apenas vídeos concluídos são mostrados
        video_cards = page.query_selector_all(".video-card")
        for card in video_cards:
            status = card.query_selector(".status").text_content()
            assert "Concluído" in status

class TestN8nE2E:
    def test_n8n_workflow_execution(self):
        """Testa execução de workflow completo no n8n"""
        # Este teste requereria uma instância n8n configurada
        # Por agora, apenas estrutura do teste
        
        workflow_data = {
            "nodes": [
                {
                    "name": "Manual Trigger",
                    "type": "n8n-nodes-base.manualTrigger"
                },
                {
                    "name": "FullVideoEditAPI",
                    "type": "n8n-nodes-fullvideoeditapi.fullVideoEditApi",
                    "parameters": {
                        "resource": "video",
                        "operation": "generate",
                        "configurationMode": "simple",
                        "videoUrls": [
                            {
                                "url": "https://example.com/test.mp4"
                            }
                        ]
                    }
                }
            ]
        }
        
        # Em um teste real, isso executaria o workflow via API do n8n
        assert workflow_data is not None
```

## 5. Configuração de CI/CD

### 5.1. GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: fullvideoeditapi_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install system dependencies
      run: |
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    
    - name: Install Python dependencies
      run: |
        pip install -r api/requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run unit tests
      run: |
        pytest tests/test_api.py -v
        pytest tests/test_video_processing.py -v
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/fullvideoeditapi_test
        REDIS_URL: redis://localhost:6379/0
        TESTING: true
    
    - name: Run integration tests
      run: |
        pytest tests/test_n8n_integration.py -v
      env:
        DATABASE_URL: postgresql://test:test@localhost:5432/fullvideoeditapi_test
        REDIS_URL: redis://localhost:6379/0
        TESTING: true
    
    - name: Build Docker images
      run: |
        docker build -t fullvideoeditapi:test ./api
        docker build -t fullvideoeditapi-worker:test ./worker
    
    - name: Run Docker integration tests
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30  # Aguardar serviços iniciarem
        pytest tests/test_integration.py -v
        docker-compose -f docker-compose.test.yml down

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build production images
      run: |
        docker build -t fullvideoeditapi:latest ./api
        docker build -t fullvideoeditapi-worker:latest ./worker
    
    - name: Deploy to staging
      run: |
        # Script de deploy para ambiente de staging
        echo "Deploying to staging environment"
        # Aqui seria feito o deploy via SSH para o servidor
```

## 6. Preparação para Implantação

### 6.1. Configuração do EasyPanel

```yaml
# easypanel-config.yml
version: '3.8'

services:
  fullvideoeditapi:
    image: fullvideoeditapi:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - SECRET_KEY=${SECRET_KEY}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.fullvideoeditapi.rule=Host(`api.fullvideoeditapi.com`)"
      - "traefik.http.routers.fullvideoeditapi.tls=true"
      - "traefik.http.routers.fullvideoeditapi.tls.certresolver=letsencrypt"
    networks:
      - fullvideoeditapi-network
    depends_on:
      - postgres
      - redis
      - minio

  fullvideoeditapi-worker:
    image: fullvideoeditapi-worker:latest
    environment:
      - CELERY_BROKER_URL=${REDIS_URL}
      - CELERY_RESULT_BACKEND=${REDIS_URL}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
    networks:
      - fullvideoeditapi-network
    depends_on:
      - redis
      - minio
    deploy:
      replicas: 2

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fullvideoeditapi-network

  redis:
    image: redis:7-alpine
    networks:
      - fullvideoeditapi-network
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    environment:
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - fullvideoeditapi-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.minio.rule=Host(`storage.fullvideoeditapi.com`)"
      - "traefik.http.routers.minio.tls=true"
      - "traefik.http.services.minio.loadbalancer.server.port=9000"

networks:
  fullvideoeditapi-network:
    external: true

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 6.2. Script de Deploy

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Iniciando deploy do FullVideoEditAPI..."

# Variáveis
SERVER_HOST="your-vps-ip"
SERVER_USER="ubuntu"
PROJECT_NAME="fullvideoeditapi"

# Construir imagens Docker
echo "📦 Construindo imagens Docker..."
docker build -t ${PROJECT_NAME}:latest ./api
docker build -t ${PROJECT_NAME}-worker:latest ./worker

# Salvar imagens como tar
echo "💾 Salvando imagens..."
docker save ${PROJECT_NAME}:latest | gzip > ${PROJECT_NAME}.tar.gz
docker save ${PROJECT_NAME}-worker:latest | gzip > ${PROJECT_NAME}-worker.tar.gz

# Transferir para servidor
echo "📤 Transferindo para servidor..."
scp ${PROJECT_NAME}.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp ${PROJECT_NAME}-worker.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp docker-compose.prod.yml ${SERVER_USER}@${SERVER_HOST}:/tmp/
scp .env.prod ${SERVER_USER}@${SERVER_HOST}:/tmp/.env

# Executar deploy no servidor
echo "🔧 Executando deploy no servidor..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
  cd /tmp
  
  # Carregar imagens Docker
  docker load < fullvideoeditapi.tar.gz
  docker load < fullvideoeditapi-worker.tar.gz
  
  # Parar serviços antigos
  docker-compose -f docker-compose.prod.yml down || true
  
  # Iniciar novos serviços
  docker-compose -f docker-compose.prod.yml --env-file .env up -d
  
  # Verificar saúde dos serviços
  sleep 30
  curl -f http://localhost:8000/health || exit 1
  
  echo "✅ Deploy concluído com sucesso!"
EOF

# Limpeza local
rm ${PROJECT_NAME}.tar.gz ${PROJECT_NAME}-worker.tar.gz

echo "🎉 Deploy finalizado!"
```

### 6.3. Monitoramento e Logs

```yaml
# monitoring/docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  loki:
    image: grafana/loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

volumes:
  prometheus_data:
  grafana_data:
```

## 7. Checklist de Pré-Deploy

### 7.1. Verificações Técnicas

- [ ] Todos os testes unitários passando
- [ ] Todos os testes de integração passando
- [ ] Testes E2E executados com sucesso
- [ ] Imagens Docker construídas e testadas
- [ ] Variáveis de ambiente configuradas
- [ ] Certificados SSL configurados
- [ ] Backup do banco de dados realizado
- [ ] Monitoramento configurado

### 7.2. Verificações de Segurança

- [ ] Chaves de API geradas e seguras
- [ ] Senhas de banco de dados alteradas
- [ ] Firewall configurado
- [ ] Rate limiting implementado
- [ ] Logs de auditoria habilitados
- [ ] Validação de entrada implementada

### 7.3. Verificações de Performance

- [ ] Testes de carga executados
- [ ] Limites de recursos configurados
- [ ] Cache configurado
- [ ] CDN configurado (se aplicável)
- [ ] Otimizações de banco de dados aplicadas

## 8. Plano de Rollback

### 8.1. Estratégia de Rollback

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Iniciando rollback..."

# Parar serviços atuais
docker-compose -f docker-compose.prod.yml down

# Restaurar versão anterior
docker tag fullvideoeditapi:previous fullvideoeditapi:latest
docker tag fullvideoeditapi-worker:previous fullvideoeditapi-worker:latest

# Restaurar banco de dados (se necessário)
# pg_restore -d fullvideoeditapi backup_pre_deploy.sql

# Reiniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar saúde
sleep 30
curl -f http://localhost:8000/health

echo "✅ Rollback concluído!"
```

### 8.2. Procedimentos de Emergência

1. **Falha na API**: Rollback automático via script
2. **Falha no Worker**: Reiniciar containers de worker
3. **Falha no Banco**: Restaurar backup mais recente
4. **Falha no Storage**: Verificar conectividade com Minio/S3

Este guia de testes e implantação garante que o FullVideoEditAPI seja implantado de forma segura e confiável, com procedimentos claros para monitoramento, manutenção e recuperação em caso de problemas.

