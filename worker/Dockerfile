# Usar a mesma imagem base do Python
FROM python:3.11-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Definir o diretório de trabalho
WORKDIR /app

# Copiar e instalar as dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código do worker
COPY ./worker.py /app/

# Comando para iniciar o worker
CMD ["celery", "-A", "worker.celery_app", "worker", "--loglevel=info"]
