# Файловый менеджер

Проект доступен по [ссылке](https://frank-file-manager.vercel.app/)

Для локального запуска:
```bash
# Переход в директорию проекта
cd frank-file-manager

# Сборка и запуск
docker build -t frank-file-manager .
docker run -d -p 8080:80 --name file-manager frank-file-manager
```
