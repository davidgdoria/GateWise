import cv2
from ultralytics import YOLO
import easyocr
import numpy as np
import re
import time
import requests

# === Configurações ===
model = YOLO("models/license_plate.pt")  # Modelo YOLO treinado para matrículas
API_URL = "http://localhost:8000/api/v1/access_check"  # Endpoint da API
CONF_THRESH = 0.3  # Confiança mínima para deteção
SHOW_DEBUG = True  # Mostrar janelas com imagem

reader = easyocr.Reader(['en'])  # Inicializar OCR

def preprocess_and_ocr(img):
    """
    Remove zonas amarelas (selo) da imagem antes de passar para OCR.
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_yellow = np.array([20, 100, 100])
    upper_yellow = np.array([40, 255, 255])
    yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)

    mask_inv = cv2.bitwise_not(yellow_mask)
    cleaned_img = cv2.bitwise_and(img, img, mask=mask_inv)

    results = reader.readtext(cleaned_img)
    if not results:
        return "", ""

    raw = " ".join([text for (_, text, _) in results])
    clean = re.sub(r'[^A-Z0-9]', '', raw.upper())
    return raw, clean

def validate_plate(plate):
    """
    Faz chamada à API com a matrícula.
    """
    try:
        r = requests.post(API_URL, json={"license_plate": plate}, timeout=2)
        return r.json()
    except:
        return {"error": "timeout"}

def main():
    cap = cv2.VideoCapture(0)
    print("🔁 Loop iniciado. Pressiona 'q' para sair.")

    last_plate = None
    last_success_time = 0
    last_attempt_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("⛔ Erro na câmara")
            break

        results = model(frame)[0]
        for b in results.boxes:
            if float(b.conf[0]) < CONF_THRESH:
                continue

            x1, y1, x2, y2 = map(int, b.xyxy[0])
            box_width = x2 - x1
            box_height = y2 - y1
            aspect_ratio = box_width / box_height

            if aspect_ratio < 2.5:
                continue

            pad = 10
            h, w = frame.shape[:2]
            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)
            x2 = min(w, x2 + pad)
            y2 = min(h, y2 + pad)

            roi = frame[y1:y2, x1:x2]
            raw, clean = preprocess_and_ocr(roi)

            now = time.time()

            if len(clean) != 6:
                continue

            if clean == last_plate and (now - last_success_time) < 20:
                continue

            if (now - last_attempt_time) < 2:
                continue

            last_attempt_time = now

            print(f"\n📸 OCR: {raw} → Matrícula limpa: {clean}")
            resp = validate_plate(clean)
            print("Resposta da API:", resp)

            if SHOW_DEBUG:
                cv2.imshow("Matrícula Detetada", roi)

            last_plate = clean
            last_success_time = now

        if SHOW_DEBUG:
            cv2.imshow("Câmara", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        time.sleep(0.1)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()