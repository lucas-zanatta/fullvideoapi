from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from celery.result import AsyncResult
from api.app.models.video_request import VideoGenerationRequest
from worker.worker import process_video_generation_task

app = FastAPI(
    title="FullVideoEditAPI",
    description="API para edição de vídeo com templates dinâmicos",
    version="1.0.0"
)

@app.post("/generate-video", status_code=202)
async def generate_video(request: VideoGenerationRequest):
    """
    Recebe uma requisição para gerar um vídeo, envia para a fila do Celery
    e retorna imediatamente com um ID de job.
    """
    try:
        # Convert Pydantic model to dict to pass to Celery
        request_dict = request.dict()
        task = process_video_generation_task.delay(request_dict)
        return {"status": "processing", "jobId": task.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/job/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Verifica e retorna o status de um job de geração de vídeo.
    """
    task_result = AsyncResult(job_id, app=process_video_generation_task.app)
    
    if task_result.state == 'PENDING':
        # Job não encontrado
        raise HTTPException(status_code=404, detail="Job not found")
        
    response = {
        "jobId": job_id,
        "status": task_result.state,
        "result": task_result.result if task_result.ready() else None
    }
    
    return response

@app.get("/health")
async def health_check():
    """
    Endpoint simples para verificar se a API está online.
    Usado pelo teste de credenciais do n8n.
    """
    return {"status": "ok"}
