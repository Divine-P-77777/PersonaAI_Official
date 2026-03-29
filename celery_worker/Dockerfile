FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the worker application code specifically to the celery_worker namespace
COPY . /app/celery_worker

# Explicitly set the app paths so Python can discover 'celery_worker' natively
ENV PYTHONPATH=/app

# Start the Celery worker connected to RabbitMQ
CMD ["celery", "-A", "celery_worker.celery_app", "worker", "--loglevel=info"]
