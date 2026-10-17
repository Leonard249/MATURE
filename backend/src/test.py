import outlines
import mlx_lm
MODEL_ID = "mlx-community/Qwen3-8B-4bit-DWQ-053125"

model = outlines.from_mlxlm(
    *mlx_lm.load(MODEL_ID)
)

# Call it to generate text
result = model("What's the capital of Latvia?", max_tokens=1000)
print(result) 