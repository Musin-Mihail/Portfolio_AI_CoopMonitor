namespace CoopMonitor.API.Services;

public interface IFileStorageService
{
    /// <summary>
    /// Загружает файл в указанный бакет.
    /// </summary>
    /// <param name="bucketName">Имя бакета (например, raw-video).</param>
    /// <param name="objectName">Имя файла в хранилище (включая путь).</param>
    /// <param name="data">Поток данных файла.</param>
    /// <param name="contentType">MIME-тип.</param>
    /// <returns>Task</returns>
    Task UploadFileAsync(string bucketName, string objectName, Stream data, string contentType);

    /// <summary>
    /// Возвращает поток файла и его Content-Type.
    /// Используется для проксирования контента без генерации публичных ссылок.
    /// </summary>
    /// <param name="bucketName">Имя бакета.</param>
    /// <param name="objectName">Имя файла.</param>
    /// <returns>Кортеж (Stream, ContentType, FileName)</returns>
    Task<(Stream FileStream, string ContentType, string FileName)> GetFileStreamAsync(string bucketName, string objectName);

    /// <summary>
    /// Проверяет существование файла.
    /// </summary>
    Task<bool> FileExistsAsync(string bucketName, string objectName);

    /// <summary>
    /// Удаляет файлы в бакете, которые старше указанного возраста.
    /// </summary>
    /// <param name="bucketName">Имя бакета.</param>
    /// <param name="retentionPeriod">Период хранения (все что старше - удаляется).</param>
    /// <returns>Количество удаленных файлов.</returns>
    Task<int> CleanupOldFilesAsync(string bucketName, TimeSpan retentionPeriod);
}