from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from model_generator import generate_model


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Solar Roof 3D MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateModelRequest(BaseModel):
    building_length: float = Field(gt=1)
    building_width: float = Field(gt=1)
    building_height: float = Field(gt=1)
    roof_pitch: float = Field(gt=1, le=60)
    roof_overhang: float = Field(default=0.45, ge=0, le=2)
    ridge_length_ratio: float = Field(default=0.56, ge=0.15, le=0.9)
    porch_length: float = Field(ge=0)
    porch_width: float = Field(ge=0)
    porch_offset: float = Field(default=0, ge=-20, le=20)
    panel_width: float = Field(default=1.1, gt=0)
    panel_height: float = Field(default=1.8, gt=0)
    panel_watt: float = Field(default=350, gt=0)
    panel_bracket_tilt: float = Field(default=-1)


@app.post("/generate-model")
def create_model(payload: GenerateModelRequest, request: Request):
    filename, stats = generate_model(payload.model_dump(), OUTPUT_DIR)
    model_url = str(request.base_url).rstrip("/") + f"/models/{filename}"
    return {"model_url": model_url, "stats": stats}


@app.get("/models/{filename}")
def get_model(filename: str):
    path = OUTPUT_DIR / filename
    return FileResponse(path, media_type="model/gltf-binary", filename=filename)
