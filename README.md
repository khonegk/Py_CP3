# КТ 3.3. Отдача файлов клиенту и отображение в React

## Запуск бэкенда (FastAPI)
    cd backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn main:app --reload
Сервер: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

## Запуск фронтенда (React + Vite)
    cd frontend
    npm install
    npm run dev
Сайт: http://localhost:5173
Бэкенд и фронтенд должны быть запущены одновременно (в двух терминалах).
