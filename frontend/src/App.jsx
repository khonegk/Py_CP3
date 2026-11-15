import { useState } from "react";
import axios from "axios";
// Адрес нашего FastAPI-сервера
const API_URL = "http://127.0.0.1:8000";
function App() {
  // Данные выбранного файла и загрузки.
  const [file, setFile] = useState(null);             // выбранный файл
  const [previewUrl, setPreviewUrl] = useState("");   // ссылка для локального предпросмотра
  const [progress, setProgress] = useState(0);        // прогресс загрузки, от 0 до 100
  const [thumbnailUrl, setThumbnailUrl] = useState(""); // миниатюра, пришедшая с сервера
  const [error, setError] = useState("");             // текст ошибки
  const [loading, setLoading] = useState(false);      // идёт ли сейчас загрузка

  // Обновляет файл и его предпросмотр.
  function handleFileChange(event) {
    const selectedFile = event.target.files[0];
    setError("");
    setThumbnailUrl("");
    setProgress(0);

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl("");
      return;
    }

    setFile(selectedFile);

    // Временная ссылка позволяет показать картинку до отправки.
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  // Отправляет файл и обрабатывает ответ сервера.
  async function handleUpload() {
    if (!file) {
      setError("Сначала выберите файл");
      return;
    }

    // Имя поля должно совпадать с параметром FastAPI.
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setProgress(0);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
          console.log(`Загружено: ${percent}%`); // прогресс в консоли
        },
      });

      setThumbnailUrl(response.data.thumbnail_url);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.detail);
      } else {
        setError("Не удалось связаться с сервером. Проверьте, что бэкенд запущен.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Загрузка изображения</h1>

      <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />

      {previewUrl && (
        <div className="block">
          <h2>Предпросмотр</h2>
          <img className="preview" src={previewUrl} alt="Предпросмотр" />
        </div>
      )}

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Загрузка..." : "Загрузить"}
      </button>

      {progress > 0 && (
        <div className="block">
          <progress value={progress} max="100"></progress>
          <span> {progress}%</span>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {thumbnailUrl && (
        <div className="block">
          <h2>Миниатюра с сервера</h2>
          <img src={thumbnailUrl} alt="Миниатюра" />
        </div>
      )}
    </div>
  );
}

export default App;
