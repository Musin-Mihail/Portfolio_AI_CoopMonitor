# CoopMonitor

CoopMonitor — это комплексная система мониторинга птичников, включающая веб-интерфейс, серверную часть на .NET, службу ИИ для анализа видео и объектное хранилище.

## 🛠 Технологический стек

- **Frontend:** Angular, PrimeNG, Tailwind CSS
- **Backend:** ASP.NET Core Web API (Entity Framework Core)
- **AI Service:** Python, FastAPI, OpenCV (Computer Vision)
- **Infrastructure:** Docker, MinIO (S3 Compatible Storage)

## 📋 Предварительные требования

Перед началом убедитесь, что у вас установлены:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (для запуска инфраструктуры)
- [.NET SDK 8.0+](https://dotnet.microsoft.com/download) (для бэкенда)
- [Node.js](https://nodejs.org/) (LTS версия) и NPM (для фронтенда)
- [Python 3.12+](https://www.python.org/) (опционально, если вы хотите запускать AI сервис без Docker)

---

## 🚀 Быстрый старт

Проект состоит из нескольких модулей. Рекомендуемый способ запуска для разработки:

1.  **Инфраструктура и AI** запускаются через Docker.
2.  **Бэкенд и Фронтенд** запускаются локально.

### 1. Запуск Инфраструктуры (Docker)

В папке `docker` находится конфигурация для MinIO (хранилище файлов) и AI-сервиса.

1.  Перейдите в папку docker:
    ```bash
    cd docker
    ```
2.  (Опционально) Проверьте настройки в файле `.env`. Стандартные учетные данные MinIO:
    - User: `admin`
    - Password: `SuperSecretPassword123!`
3.  Запустите контейнеры:
    ```bash
    docker-compose up -d
    ```

> **Примечание:** При запуске автоматически отработает скрипт `create_buckets.sh`, который создаст необходимые бакеты в MinIO (`raw-video`, `reports`, `ai-models` и др.).

**Доступные сервисы:**

- **MinIO Console:** [http://localhost:9001](http://localhost:9001)
- **AI Service API:** [http://localhost:5001](http://localhost:5001)

---

### 2. Запуск Backend (ASP.NET Core)

Бэкенд управляет данными, пользователями и взаимодействует с оборудованием.

1.  Перейдите в папку проекта API:
    ```bash
    cd backend/CoopMonitor.API
    ```
2.  Восстановите зависимости:
    ```bash
    dotnet restore
    ```
3.  Примените миграции базы данных (если требуется):
    ```bash
    dotnet ef database update
    ```
4.  Запустите сервер:
    ```bash
    dotnet run
    ```

Сервер запустится (обычно) на `https://localhost:7xxx` или `http://localhost:5xxx` (см. вывод консоли).

---

### 3. Запуск Frontend (Angular)

Веб-интерфейс для операторов и администраторов.

1.  Перейдите в папку фронтенда:
    ```bash
    cd frontend
    ```
2.  Установите зависимости:
    ```bash
    npm install
    ```
3.  Запустите приложение:
    ```bash
    npm start
    ```

Приложение будет доступно по адресу: [http://localhost:4200](http://localhost:4200)

---

## 📂 Структура проекта

```text
.
├── ai-service/          # Микросервис компьютерного зрения (Python/FastAPI)
│   ├── app/             # Логика обнаружения объектов и обработки видео
│   └── Dockerfile       # Сборка образа для AI
├── backend/             # Основной API (ASP.NET Core)
│   ├── CoopMonitor.API/ # Контроллеры, DTO, настройки
│   └── Data/            # Контекст базы данных (CoopContext)
├── docker/              # Инфраструктура
│   ├── docker-compose.yml # Оркестрация MinIO и AI сервиса
│   └── .env             # Переменные окружения
└── frontend/            # Клиентское приложение (Angular)
    └── src/app/         # Компоненты, сервисы, модели
```
