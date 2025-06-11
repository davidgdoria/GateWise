import cv2
import requests

API_TOKEN = '5f05d4737cc20b19f28e817cde1fbeb1ef35d81b'
API_URL = 'https://api.platerecognizer.com/v1/plate-reader/'

def capture_frame():
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        raise Exception("Erro ao capturar imagem da câmara")

    # Guarda temporariamente a imagem
    image_path = 'frame.jpg'
    cv2.imwrite(image_path, frame)
    return image_path

def send_to_api(image_path):
    with open(image_path, 'rb') as img_file:
        response = requests.post(
            API_URL,
            files={'upload': img_file},
            headers={'Authorization': f'Token {API_TOKEN}'}
        )
    return response.json()

def main():
    print("A capturar imagem e a enviar para a API...")
    image_path = capture_frame()
    result = send_to_api(image_path)

    if 'results' in result and result['results']:
        plate = result['results'][0]['plate']
        print(f"Matrícula detetada: {plate.upper()}")
        # Verifica acesso no backend
        access_result = check_access_backend(plate.upper().replace(" ", ""))
        if access_result is not None:
            if access_result.get('access_granted'):
                print("Acesso CONCEDIDO pelo backend!")
            else:
                print(f"Acesso NEGADO pelo backend: {access_result.get('reason')}")
        else:
            print("Erro ao comunicar com backend para verificar acesso.")
    else:
        print("Nenhuma matrícula detetada.")


def check_access_backend(plate):
    try:
        backend_url = 'http://localhost:8000/api/v1/access_check'
        response = requests.post(backend_url, json={"license_plate": plate})
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erro backend: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Erro ao conectar ao backend: {e}")
        return None


if __name__ == '__main__':
    main()