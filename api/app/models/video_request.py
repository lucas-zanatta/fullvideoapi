from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any

class VideoUrl(BaseModel):
    url: str # Alterado para string para aceitar URLs de exemplo não-válidas
    startTime: Optional[float] = 0
    endTime: Optional[float] = 0

class AudioUrl(BaseModel):
    url: str # Alterado para string
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
