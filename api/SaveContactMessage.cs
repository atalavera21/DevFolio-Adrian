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

            // Enviar email
            var emailSent = await SendEmailNotificationAsync(formData);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { success = true, message = "Mensaje enviado correctamente", emailNotification = emailSent });
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

    private async Task<bool> SendEmailNotificationAsync(ContactFormData formData)
    {
        var connectionString = Environment.GetEnvironmentVariable("ACS_CONNECTION_STRING");
        var senderEmail = Environment.GetEnvironmentVariable("ACS_SENDER_EMAIL");
        var recipientEmail = Environment.GetEnvironmentVariable("NOTIFICATION_EMAIL") ?? "atalavera.0596@gmail.com";

        if (string.IsNullOrEmpty(connectionString) || string.IsNullOrEmpty(senderEmail))
        {
            _logger.LogWarning("Azure Communication Services no configurado");
            return false;
        }

        try
        {
            var emailClient = new EmailClient(connectionString);
            var subject = $"Nuevo mensaje de contacto: {formData.Subject ?? "Sin asunto"}";

            var htmlContent = $@"
<html><body>
<h2>Nuevo Mensaje de Contacto</h2>
<p><strong>Nombre:</strong> {formData.Name}</p>
<p><strong>Email:</strong> {formData.Email}</p>
<p><strong>Asunto:</strong> {formData.Subject ?? "Sin asunto"}</p>
<p><strong>Mensaje:</strong></p>
<p>{formData.Message}</p>
</body></html>";

            var emailMessage = new EmailMessage(
                senderAddress: senderEmail,
                recipientAddress: recipientEmail,
                content: new EmailContent(subject) { Html = htmlContent });

            await emailClient.SendAsync(Azure.WaitUntil.Started, emailMessage);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando email");
            return false;
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