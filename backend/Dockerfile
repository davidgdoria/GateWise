FROM python:3.11-slim

WORKDIR /app

# Instala o netcat para o wait-for-it.sh funcionar
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
