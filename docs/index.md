# Documentação Completa do FullVideoEditAPI

**Versão:** 1.0.0

Bem-vindo à documentação oficial do FullVideoEditAPI, uma solução completa para a automação da criação de vídeos dinâmicos.

---

## Sumário

1.  [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2.  [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3.  [Guia de Implantação (VPS Ubuntu)](#3-guia-de-implantação-vps-ubuntu)
4.  [Documentação da API](#4-documentação-da-api)
5.  [Uso do Nó n8n](#5-uso-do-nó-n8n)
6.  [Testando com n8n Local](#6-testando-com-n8n-local)

---

## 1. Visão Geral do Projeto

O FullVideoEditAPI é uma solução para a automação da criação de vídeos. Inspirado em ferramentas como o Placid.app, o projeto foca exclusivamente na edição de vídeo programática, permitindo que os usuários gerem conteúdo de vídeo personalizado em escala.

### Componentes Principais

*   **API Backend (Python/FastAPI)**: O núcleo do sistema. Uma API RESTful que recebe requisições, gerencia o processamento e renderiza os vídeos finais.
*   **Worker de Processamento (Celery)**: Um serviço assíncrono que lida com a tarefa intensiva de processamento de vídeo, garantindo que a API permaneça responsiva.
*   **Nó de Comunidade n8n**: Uma integração direta com o n8n que permite aos usuários configurar e acionar a geração de vídeos diretamente de seus workflows de automação.

## 2. Arquitetura do Sistema

O sistema é projetado com uma arquitetura de microsserviços, containerizada com Docker para fácil implantação e escalabilidade.

*   **Fluxo de Requisição**:
    1.  O **Nó n8n** envia uma requisição para a **API FastAPI**.
    2.  A **API** valida a requisição, cria um job e o envia para uma fila do **Redis**.
    3.  Um **Worker Celery** consome o job da fila e executa o processamento do vídeo.
    4.  O vídeo final é salvo em um serviço de armazenamento (como Minio/S3).
    5.  (Opcional) Um **webhook** é enviado de volta ao n8n com a URL do vídeo final.

![Arquitetura Simplificada](https://i.imgur.com/your-architecture-diagram.png) 
*(Nota: Substitua o link acima por um diagrama real da sua arquitetura)*

## 3. Guia de Implantação (VPS Ubuntu)

Siga estes passos para implantar o FullVideoEditAPI em sua VPS.

### Pré-requisitos

*   Uma VPS com Ubuntu 22.04 ou superior.
*   `git`, `python3-pip`, `python3-venv` e `redis-server` instalados.
*   Acesso de terminal à sua VPS.

### Passos de Implantação

1.  **Instale Dependências do Sistema**:
    ```bash
    sudo apt-get update
    sudo apt-get install -y git python3-pip python3-venv redis-server
    ```

2.  **Clone o Repositório**:
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```

3.  **Configure e Inicie a API**:
    *   Crie um ambiente virtual:
        ```bash
        python3 -m venv venv-api
        source venv-api/bin/activate
        ```
    *   Instale as dependências:
        ```bash
        pip install -r api/requirements.txt
        ```
    *   Inicie a API em segundo plano:
        ```bash
        uvicorn api.app.main:app --host 0.0.0.0 --port 8000 &
        ```

4.  **Configure e Inicie o Worker**:
    *   Crie um ambiente virtual para o worker:
        ```bash
        python3 -m venv venv-worker
        source venv-worker/bin/activate
        ```
    *   Instale as dependências:
        ```bash
        pip install -r worker/requirements.txt
        ```
    *   Inicie o worker Celery em segundo plano:
        ```bash
        celery -A worker.worker worker --loglevel=info &
        ```

5.  **Verificação**:
    *   Acesse `http://<IP_DA_SUA_VPS>:8000/health` no seu navegador. Você deve ver `{"status":"ok"}`.
    *   Use `jobs` no terminal para ver os processos rodando em segundo plano.

## 4. Documentação da API

### Autenticação

A API utiliza Bearer Tokens para autenticação. Inclua o token no header `Authorization`.

`Authorization: Bearer SUA_API_KEY`

*(Nota: A API de simulação atual não valida a chave, mas a estrutura está pronta).*

### Endpoints

#### `POST /generate-video`

Inicia um novo job de geração de vídeo.

*   **Corpo da Requisição (`application/json`)**:
    ```json
    {
      "videoUrls": [
        {
          "url": "https://example.com/video1.mp4",
          "startTime": 0,
          "endTime": 10
        }
      ],
      "audioUrls": [
        {
          "url": "https://example.com/audio.mp3",
          "volume": 0.8,
          "loop": true
        }
      ],
      "textOverlays": [
        {
          "text": "Olá Mundo!",
          "font": "Arial",
          "color": "#FFD700",
          "positionX": 50,
          "positionY": 10,
          "startTime": 1,
          "endTime": 5,
          "animation": "fade-in"
        }
      ],
      "outputSettings": {
        "format": "mp4",
        "resolution": "1920x1080"
      },
      "webhookUrl": "https://seu-n8n.com/webhook/123"
    }
    ```
*   **Resposta de Sucesso (`202 Accepted`)**:
    ```json
    {
      "status": "processing",
      "jobId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    }
    ```

#### `GET /job/{job_id}/status`

Verifica o status de um job de geração de vídeo.

*   **Resposta de Sucesso (`200 OK`)**:
    ```json
    {
      "jobId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "status": "SUCCESS",
      "result": {
        "status": "completed",
        "videoUrl": "https://example.com/path/to/generated/video.mp4"
      }
    }
    ```

#### `GET /health`

Verifica a saúde da API. Usado para o teste de credenciais do n8n.

*   **Resposta de Sucesso (`200 OK`)**:
    ```json
    {
      "status": "ok"
    }
    ```

## 5. Uso do Nó n8n

### Instalação

Siga o [guia de instalação de nós de comunidade](https://docs.n8n.io/integrations/community-nodes/installation/) do n8n para instalar o pacote `n8n-nodes-video-editor`.

### Configuração das Credenciais

1.  No n8n, vá para **Credentials** e clique em **New**.
2.  Procure por **Video Editor API** e selecione.
3.  Preencha os campos:
    *   **API Base URL**: A URL da sua API implantada (ex: `http://<IP_DA_SUA_VPS>:8000`).
    *   **API Key**: Sua chave de API.
4.  Clique em **Save**. O n8n testará a conexão com o endpoint `/health`.

### Exemplo de Workflow

1.  Adicione o nó **Video Editor** ao seu canvas.
2.  Selecione a credencial que você acabou de criar.
3.  A operação `Generate Video` já estará selecionada.
4.  Preencha os campos desejados, como **Video URLs** e **Text Overlays**.
5.  (Opcional) Adicione um nó **Webhook** ao seu workflow e copie a URL de teste. Cole essa URL no campo **Webhook URL** do nó Video Editor para receber uma notificação quando o vídeo estiver pronto.
6.  Execute o workflow.

## 6. Testando com n8n Local

Para conectar sua instância local do n8n à API na sua VPS e receber webhooks, você precisa expor seu n8n local à internet.

1.  **Use o ngrok**: O [ngrok](https://ngrok.com/) é uma ferramenta que cria um túnel seguro para o seu localhost.
    *   Instale e configure o ngrok.
    *   Execute o comando: `ngrok http 5678` (a porta padrão do n8n).
    *   O ngrok fornecerá uma URL pública (ex: `https://random-string.ngrok.io`).

2.  **Configure o Webhook**:
    *   Crie um nó **Webhook** no seu workflow n8n.
    *   Use a URL pública do ngrok como a URL base para o seu webhook.
    *   Copie a URL completa do webhook de teste.

3.  **Execute o Teste**:
    *   No nó **Video Editor**, cole a URL do webhook do ngrok no campo **Webhook URL**.
    *   Execute o workflow.
    *   A API na sua VPS enviará a notificação de conclusão para a URL do ngrok, que a redirecionará para o seu n8n local.
