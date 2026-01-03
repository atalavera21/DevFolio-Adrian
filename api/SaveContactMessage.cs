using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Azure.Data.Tables;
using Azure.Communication.Email;
using System.Net;
using System.Text.Json;

namespace ContactFormAPI;

public class SaveContactMessage
{
    private readonly ILogger<SaveContactMessage> _logger;

    public SaveContactMessage(ILogger<SaveContactMessage> logger)
    {
        _logger = logger;
    }

    [Function("SaveContactMessage")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
    {
        _logger.LogInformation("Procesando nuevo mensaje de contacto");

        try
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var formData = JsonSerializer.Deserialize<ContactFormData>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (formData == null || string.IsNullOrWhiteSpace(formData.Name) ||
                string.IsNullOrWhiteSpace(formData.Email) || string.IsNullOrWhiteSpace(formData.Message))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteAsJsonAsync(new { success = false, error = "Los campos nombre, email y mensaje son requeridos" });
                return badResponse;
            }

            // Guardar en Azure Table Storage
            var storageConnectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
            var tableClient = new TableClient(storageConnectionString, "ContactMessages");
            await tableClient.CreateIfNotExistsAsync();

            var entity = new ContactMessageEntity
            {
                PartitionKey = "Contact",
                RowKey = Guid.NewGuid().ToString(),
                Name = formData.Name.Trim(),
                Email = formData.Email.Trim().ToLower(),
                Subject = string.IsNullOrWhiteSpace(formData.Subject) ? "Sin asunto" : formData.Subject.Trim(),
                Message = formData.Message.Trim(),
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await tableClient.AddEntityAsync(entity);
            _logger.LogInformation("Mensaje guardado con ID: {RowKey}", entity.RowKey);

            // Enviar email de notificación
            await SendNotificationEmail(formData, entity.RowKey);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { success = true, message = "Mensaje enviado correctamente" });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando mensaje");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { success = false, error = "Error interno del servidor" });
            return errorResponse;
        }
    }

    private async Task SendNotificationEmail(ContactFormData formData, string messageId)
    {
        try
        {
            var connectionString = Environment.GetEnvironmentVariable("ACS_CONNECTION_STRING");
            var senderEmail = Environment.GetEnvironmentVariable("ACS_SENDER_EMAIL");
            var notificationEmail = Environment.GetEnvironmentVariable("NOTIFICATION_EMAIL");

            if (string.IsNullOrEmpty(connectionString) || string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(notificationEmail))
            {
                _logger.LogWarning("Email configuration missing, skipping notification");
                return;
            }

            var emailClient = new EmailClient(connectionString);

            var subject = $"Nuevo mensaje de contacto: {formData.Subject ?? "Sin asunto"}";
            var htmlContent = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #1e3a5f;'>Nuevo mensaje de contacto</h2>
                    <hr style='border: 1px solid #e0e0e0;'>
                    <p><strong>De:</strong> {formData.Name}</p>
                    <p><strong>Email:</strong> <a href='mailto:{formData.Email}'>{formData.Email}</a></p>
                    <p><strong>Asunto:</strong> {formData.Subject ?? "Sin asunto"}</p>
                    <p><strong>Mensaje:</strong></p>
                    <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px;'>
                        {formData.Message.Replace("\n", "<br>")}
                    </div>
                    <hr style='border: 1px solid #e0e0e0; margin-top: 20px;'>
                    <p style='color: #666; font-size: 12px;'>ID del mensaje: {messageId}</p>
                </body>
                </html>";

            var emailMessage = new EmailMessage(
                senderAddress: senderEmail,
                recipientAddress: notificationEmail,
                content: new EmailContent(subject)
                {
                    Html = htmlContent
                });

            await emailClient.SendAsync(Azure.WaitUntil.Started, emailMessage);
            _logger.LogInformation("Email de notificación enviado");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando email de notificación");
            // No lanzamos la excepción para no afectar el guardado del mensaje
        }
    }
}

public class ContactFormData
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class ContactMessageEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public Azure.ETag ETag { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}