from pydantic import BaseModel, Field
from typing import List

class DetectMaizeDiseaseInputSchema(BaseModel):
    imageDataUri: str = Field(description="A photo of a maize leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.")

class DetectMaizeDiseaseOutputSchema(BaseModel):
    diseaseName: str = Field(description="The predicted disease name. If no disease is detected or the image is not a maize leaf, indicate that.")
    confidence: float = Field(description="The confidence score of the prediction (0-1). Set to 0 if no disease detected or not a maize leaf.")
    description: str = Field(description="A description of the detected disease. Provide helpful information even if no disease is found (e.g., 'Leaf appears healthy').")
    solutions: List[str] = Field(description="Recommended solutions to address the disease. Empty array if healthy.")
    preventiveMeasures: List[str] = Field(description="Preventive measures to avoid the disease. Empty array if healthy.")
