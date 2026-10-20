import outlines
import mlx_lm
from datetime import datetime
from .models import ExtractionPayload

MODEL_ID = "mlx-community/Qwen3-8B-4bit-DWQ-053125"

print(f"Loading MLX model with Schema Enforcement: {MODEL_ID}...")
try:
    model = outlines.from_mlxlm(*mlx_lm.load(MODEL_ID))
    generator = outlines.Generator(model, ExtractionPayload)
    
    print("✅ Constrained Model loaded successfully into Unified Memory.")
except Exception as e:
    print(f"❌ Failed to load MLX model: {e}")
    generator = None

def extract_transactions_from_text(text: str) -> ExtractionPayload:
    if not generator:
        raise RuntimeError("LLM Generator is not initialized.")
    
    # get current date incase input includes terms like 'today' or 'yesterday'
    today_str = datetime.now().strftime("%A, %Y-%m-%d")
    
    prompt = f"""Extract ALL financial transactions from the user's text.
IMPORTANT CONTEXT: Today is {today_str}. Calculate relative dates into YYYY-MM-DD.

User Text:
"{text}"
"""

    # The generator returns the fully validated Pydantic object directly.
    result = generator(prompt, max_tokens=4000)
    
    # parse the json result into model, both string json and direct pydantic model output
    if isinstance(result, str):
        transaction = ExtractionPayload.model_validate_json(result)
    else:
        transaction = result
    
    return transaction

if __name__ == "__main__":
    test_note = """8 oct 
Lunch: 8.6
Dinner: 8.8"""
    print(f"\n📝 Testing Input: \n\"{test_note}\"\n")
    print("🧠 Thinking (with strict schema enforcement)...\n")
    
    try:
        result = extract_transactions_from_text(test_note)
        print("✅ SUCCESS! Validated Pydantic Output:\n")
        print(result.model_dump_json(indent=2))
    except Exception as e:
        print("❌ ERROR:\n")
        print(str(e))