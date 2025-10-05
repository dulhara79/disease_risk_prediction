# Base image
FROM python:3.9-slim

# Install system dependencies (libgomp for LightGBM/optimized numerical libraries)
# We update apt, install libgomp1, and clean up the cache to keep the image small.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .
# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything (app files and the 'models' directory)
# Ensure your 'models' directory is in the context where you run the build command.
COPY . .

# Expose port
EXPOSE 8000

# Start app
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]