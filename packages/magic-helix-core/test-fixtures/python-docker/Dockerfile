# Python Docker test fixture for Magic Helix plugin
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install poetry && poetry new poetryproj && \
    echo '[tool.poetry]\nname = "poetryproj"\nversion = "0.1.0"\ndescription = "Poetry test"\n' > poetryproj/pyproject.toml && \
    echo 'print("hello world")' > poetryproj/hello.py
CMD ["python", "poetryproj/hello.py"]
