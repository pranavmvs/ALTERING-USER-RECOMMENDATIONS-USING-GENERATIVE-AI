from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "meta/llama-3-8b"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)


