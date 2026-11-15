import os
import uuid
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
app = FastAPI()

# Разрешаем запросы от локального React-приложения.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ограничения загрузки и папки для изображений.
ALLOWED_TYPES = ["image/png", "image/jpeg"]  # разрешённые типы файлов
MAX_SIZE = 5 * 1024 * 1024                   # 5 МБ в байтах
THUMB_SIZE = (200, 200)                      # максимальный размер миниатюры
ORIGINALS_DIR = "images/originals"           # сюда кладём оригиналы
THUMBS_DIR = "images/thumbnails"             # сюда кладём миниатюры

# Папки создаются до подключения StaticFiles.
os.makedirs(ORIGINALS_DIR, exist_ok=True)
os.makedirs(THUMBS_DIR, exist_ok=True)

# Раздаём сохранённые изображения по адресу /images.
app.mount("/images", StaticFiles(directory="images"), name="images")

@app.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    # Проверяем формат и размер файла.
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Неверный формат файла. Разрешены только PNG и JPEG.",
        )
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Файл слишком большой. Максимальный размер - 5 МБ.",
        )
    # UUID не даёт файлам с одинаковыми именами перезаписывать друг друга.
    extension = "png" if file.content_type == "image/png" else "jpg"
    filename = f"{uuid.uuid4()}.{extension}"
    original_path = os.path.join(ORIGINALS_DIR, filename)
    with open(original_path, "wb") as f:
        f.write(content)
    # Создаём миниатюру, сохраняя пропорции исходного изображения.
    thumb_path = os.path.join(THUMBS_DIR, filename)
    try:
        with Image.open(original_path) as image:
            image.thumbnail(THUMB_SIZE)
            image.save(thumb_path)
    except Exception:
        # Удаляем оригинал, если Pillow не смог создать миниатюру.
        os.remove(original_path)
        raise HTTPException(
            status_code=400,
            detail="Файл повреждён или не является изображением.",
        )
    # Возвращаем клиенту полные ссылки на файлы.
    base_url = str(request.base_url)
    return {
        "message": "Файл успешно загружен",
        "original_url": f"{base_url}images/originals/{filename}",
        "thumbnail_url": f"{base_url}images/thumbnails/{filename}",
    }
