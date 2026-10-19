FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir ".[dev]"
COPY . .
EXPOSE 4000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "4000"]
