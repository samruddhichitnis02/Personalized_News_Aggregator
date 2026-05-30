# use official Python 3.11 slim image as base
FROM python:3.11-slim

# set working directory inside container
WORKDIR /app

# copy requirements first (Docker caching optimization)
# if requirements don't change, Docker skips reinstalling packages
COPY requirements.txt .

# install all Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy rest of the application code
COPY . .

# expose port 8000 so it's accessible outside the container
EXPOSE 8000

# command to run when container starts
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]