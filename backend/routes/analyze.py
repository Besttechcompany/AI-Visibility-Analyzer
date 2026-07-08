from fastapi import APIRouter
from pydantic import BaseModel

from services.analyzer import WebsiteAnalyzer

router = APIRouter()


class WebsiteRequest(BaseModel):
    url: str


@router.post("/analyze")
def analyze(request: WebsiteRequest):

    return WebsiteAnalyzer.analyze(
        request.url
    )