import outlines
import mlx_lm
from datetime import datetime
from models import ExtractionPayload

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
    result = generator(prompt)
    
    # parse the json result into model
    transaction = ExtractionPayload.model_validate_json(result)
    
    return transaction

if __name__ == "__main__":
    test_note = """
16 sep 
Dinner: 19.3

17 sep
Mosquito attractor: 6.20
Wire organiser: 0.27
Butterfly: 1.5
Lunch: 12
Dinner: 12 

18 sep 
Lunch: 5.5
Dinner: 50.8

19 sep
Bf: 8.85
Dinner: 14.8
Badminton: 35

20 sep 
Bf/ lunch: 7.9
Badminton grip: 1.24
Greetings card: 1

21 sep:
Bf: 5.9
Soup: 4
Mixed rice: 6.84
Rubber remover: 1.49
Hipper: 0.83

22 sep:
Sticker: 0.58
Lunch: 10
Dinner: 6.12

23 sep
Lunch: 6.3
Dinner: 6.8

24 sep:
Bf: 1.5
Lunch: 8
Dinz: 22

25 sep: 
Bf: 1.5
Lunch: 5.5
Dinner: 42.44

26 sep
Dinner: 9.48

27 sep
Bed side table: 4.41
Stickers: 1.04
Headphone cover: 3.49


28 sep
Lunch: 7.3
Waffle: 2.5
Dinz: 8.9

29 sep
Lunch 7.9
Dinner: 8.34


30 sep
Lunch: 9.3
Waffle: 2.5
Dinner: 11
Socks: 5.93"""
    print(f"\n📝 Testing Input: \n\"{test_note}\"\n")
    print("🧠 Thinking (with strict schema enforcement)...\n")
    
    try:
        result = extract_transactions_from_text(test_note)
        print("✅ SUCCESS! Validated Pydantic Output:\n")
        print(result.model_dump_json(indent=2))
    except Exception as e:
        print("❌ ERROR:\n")
        print(str(e))