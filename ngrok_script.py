from pyngrok import ngrok
import time

try:
    public_url_frontend = ngrok.connect(5173).public_url
    public_url_backend = ngrok.connect(8000).public_url
    print(f"Frontend URL: {public_url_frontend}")
    print(f"Backend URL: {public_url_backend}")
    while True:
        time.sleep(1)
except Exception as e:
    print(f"Error: {e}")
