import os


def _get_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


bind = "127.0.0.1:8000"
worker_class = "uvicorn.workers.UvicornWorker"
workers = _get_int("MOP_GUNICORN_WORKERS", 3)
threads = _get_int("MOP_GUNICORN_THREADS", 1)
timeout = _get_int("MOP_GUNICORN_TIMEOUT", 120)
graceful_timeout = _get_int("MOP_GUNICORN_GRACEFUL_TIMEOUT", 30)
keepalive = _get_int("MOP_GUNICORN_KEEPALIVE", 5)
accesslog = "-"
errorlog = "-"
