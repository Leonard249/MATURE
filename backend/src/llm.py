from mlx_lm import load, generate
from datetime import datetime
import json

from src.models import ExtractionPayload

MODEL_ID = "mlx-community/Qwen3-8B-4bit-DWQ-053125"

# Load the model into Mac Unified Memory globally so it isn't reloaded on every request
print(f"Loading MLX model: {MODEL_ID}...")
try:
    model, tokenizer = load(MODEL_ID)
    print("✅ Model loaded successfully into Unified Memory.")
except Exception as e:
    print(f"❌ Failed to load MLX model: {e}")
    model, tokenizer = None, None

def extract_transactions_from_text(text: str) -> ExtractionPayload:
    if not model or tokenizer:
        raise RuntimeError("LLM Generator is not initialized.")
    
    today_str = datetime.now().strftime("%A, %Y-%m-%d")
    schema_instructions = json.dumps(ExtractionPayload.model_json_schema(), indent=2)
    
    prompt = f"""You are a precise financial data extraction API. 
    Extract ALL financial transactions from the user's text.

    IMPORTANT CONTEXT: 
    Today is {today_str}. Use this to calculate relative dates (yesterday, last Friday) into YYYY-MM-DD format.

    You must reply with ONLY a raw JSON object that strictly matches the following JSON Schema:
    {schema_instructions}

    Do NOT wrap the output in ```json markdown blocks. 
    Do NOT include any conversational text like "Here is your data". 
    Output strictly the raw JSON bracket object and nothing else.

    User Text:
    "{text}"
    """

    # Generate the text response
    raw_response = generate(
        model, 
        tokenizer, 
        prompt=prompt, 
        max_tokens=1000, 
        verbose=False
    )
    
    # Clean up the output in case the LLM disobeys and adds markdown blocks anyway
    clean_json = raw_response.strip()
    if clean_json.startswith("```json"):
        clean_json = clean_json.replace("```json", "", 1)
    if clean_json.endswith("```"):
        clean_json = clean_json[:clean_json.rfind("```")]
    clean_json = clean_json.strip()
    
    try:
        # 1. Parse the string into a Python dictionary
        parsed_dict = json.loads(clean_json)
        
        # 2. Pass it through Pydantic
        validated_payload = ExtractionPayload.model_validate(parsed_dict)
        return validated_payload
        
    except json.JSONDecodeError as e:
        # If the LLM didn't output valid JSON, raise an error WITH the raw output
        raise ValueError(f"LLM failed to output valid JSON. Raw output was:\n\n{raw_response}")
    except Exception as e:
        # Catch Pydantic Validation errors (e.g. wrong category used)
        raise ValueError(f"LLM output failed validation: {str(e)}\n\nRaw output was:\n\n{raw_response}")