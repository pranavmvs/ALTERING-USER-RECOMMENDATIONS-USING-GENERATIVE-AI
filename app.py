from transformers import AutoTokenizer, AutoModelForCausalLM
from flask import Flask,request
from flask_ngrok import run_with_ngrok
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# run_with_ngrok(app)

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("abhimadd/crec1")
model = AutoModelForCausalLM.from_pretrained("abhimadd/crec1")

@app.get("/")
def say_hello():
        return "Hello World!"

@app.post("/generate")
def generate_text():
    try:
        data = request.get_json()
        query = data.get('query')
        inputs = tokenizer(query, return_tensors='pt', padding=True, truncation=True)
        output_ids = model.generate(
            inputs['input_ids'],
            attention_mask=inputs['attention_mask'],
            pad_token_id=tokenizer.eos_token_id,
            max_length=100,  # Set a reasonable max length to avoid infinite loops
            num_return_sequences=1,
            temperature=0.7,
            top_k=50,
            top_p=0.9
        )
        output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
        return {"generated_text": output_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    app.run()