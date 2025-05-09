from genkit import define_flow, define_prompt
from flask_backend.ai_config import ai
from .schemas import DetectMaizeDiseaseInputSchema, DetectMaizeDiseaseOutputSchema

detect_maize_disease_prompt = define_prompt(
    name="detect_maize_disease_prompt_python",
    input_schema=DetectMaizeDiseaseInputSchema,
    output_schema=DetectMaizeDiseaseOutputSchema,
    config={
        "model": "gemini-1.5-flash-latest", # Ensure you have a model that supports image input
         "safety_settings": [ # Optional: configure safety settings
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
        ],
         "temperature": 0.3, # Adjust temperature for creativity vs. factuality
    },
    prompt_template=(
        "Analyze the provided image of a maize leaf. Identify any diseases present.\n\n"
        "Image: {{media url=imageDataUri}}\n\n"
        "Respond with the disease name, confidence score (0-1), a description of the disease "
        "(or confirmation of health), recommended solutions, and preventive measures.\n\n"
        "If the image is not a maize leaf or no disease is detected, set diseaseName appropriately "
        "(e.g., \"Not a Maize Leaf\", \"Healthy\"), confidence to 0, provide a relevant description, "
        "and leave solutions/preventiveMeasures as empty arrays.\n"
        "Ensure the output strictly adheres to the JSON schema."
    )
)

@define_flow(
    name="detect_maize_disease_flow_python",
    input_schema=DetectMaizeDiseaseInputSchema,
    output_schema=DetectMaizeDiseaseOutputSchema,
)
async def detect_maize_disease_flow(payload: DetectMaizeDiseaseInputSchema) -> DetectMaizeDiseaseOutputSchema:
    print(f"Python Flow: Calling detect_maize_disease_prompt with input: {payload.imageDataUri[:50]}...")
    try:
        response = await detect_maize_disease_prompt.generate(payload)
        output = response.output
        if output is None:
            print("Python Flow: AI prompt returned None output")
            raise ValueError("AI analysis failed to produce a result.")

        # Pydantic automatically validates the output against DetectMaizeDiseaseOutputSchema
        # upon successful parsing by the prompt's output_schema.
        print("Python Flow: AI prompt execution successful.")
        return output # No need to cast, Pydantic model is returned
    except Exception as e:
        print(f"Python Flow: Error during AI prompt execution: {e}")
        # Provide a default error response that matches the schema
        return DetectMaizeDiseaseOutputSchema(
            diseaseName="Analysis Error",
            confidence=0.0,
            description=f"An error occurred during the AI analysis in Python: {str(e)}. Please check the image or try again later.",
            solutions=[],
            preventiveMeasures=[],
        )

# This function is what the Flask endpoint will call
async def detect_maize_disease(input_data: DetectMaizeDiseaseInputSchema) -> DetectMaizeDiseaseOutputSchema:
    return await detect_maize_disease_flow(input_data)
