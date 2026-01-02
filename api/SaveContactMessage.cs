using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Azure.Data.Tables;
using Azure.Communication.Email;
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
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
    {
        _logger.LogInformation("Procesando nuevo mensaje de contacto");

        try
        {
            // 1. Leer y validar datos del formulario
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var formData = JsonSerializer.Deserialize<ContactFormData>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (formData == null || string.IsNullOrWhiteSpace(formData.Name) ||
                string.IsNullOrWhiteSpace(formData.Email) || string.IsNullOrWhiteSpace(formData.Message))
            {
                return new BadRequestObjectResult(new { 
                    success = false, 
                    error = "Los campos nombre, email y mensaje son requeridos" 
                });
            }

            // Validación básica de email
            if (!IsValidEmail(formData.Email))
            {
                return new BadRequestObjectResult(new { 
                    success = false, 
                    error = "El formato del email no es válido" 
                });
            }

            // 2. Guardar en Azure Table Storage
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
            _logger.LogInformation("Mensaje guardado en Table Storage con ID: {RowKey}", entity.RowKey);

            // 3. Enviar notificación por email usando Azure Communication Services
            var emailSent = await SendEmailNotificationAsync(formData);
            
            return new OkObjectResult(new { 
                success = true, 
                message = "Mensaje enviado correctamente",
                emailNotification = emailSent
            });
        }
        catch (JsonException)
        {
            _logger.LogWarning("Error al deserializar el JSON del request");
            return new BadRequestObjectResult(new { 
                success = false, 
                error = "Formato de datos inválido" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando mensaje de contacto");
            return new ObjectResult(new { 
                success = false, 
                error = "Error interno del servidor" 
            }) { StatusCode = StatusCodes.Status500InternalServerError };
        }
    }

    private async Task<bool> SendEmailNotificationAsync(ContactFormData formData)
    {
        var connectionString = Environment.GetEnvironmentVariable("ACS_CONNECTION_STRING");
        var senderEmail = Environment.GetEnvironmentVariable("ACS_SENDER_EMAIL");
        var recipientEmail = Environment.GetEnvironmentVariable("NOTIFICATION_EMAIL") ?? "atalavera.0596@gmail.com";

        if (string.IsNullOrEmpty(connectionString) || string.IsNullOrEmpty(senderEmail))
        {
            _logger.LogWarning("Azure Communication Services no configurado, email no enviado");
            return false;
        }

        try
        {
            var emailClient = new EmailClient(connectionString);

            var subject = $"Nuevo mensaje de contacto: {formData.Subject ?? "Sin asunto"}";

            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        .header {{ background: linear-gradient(135deg, #1e3a8a 0%, #475569 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }}
        .header h2 {{ margin: 0; font-size: 20px; }}
        .content {{ background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; }}
        .field {{ margin-bottom: 16px; padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #1e3a8a; }}
        .label {{ font-weight: 600; color: #1e3a8a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .value {{ margin-top: 4px; color: #334155; }}
        .message-box {{ background: white; padding: 16px; border-radius: 6px; border-left: 3px solid #10b981; margin-top: 8px; }}
        .footer {{ text-align: center; padding: 16px; color: #64748b; font-size: 12px; border-radius: 0 0 8px 8px; background: #f1f5f9; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>📩 Nuevo Mensaje de Contacto</h2>
        </div>
        <div class=""content"">
            <div class=""field"">
                <div class=""label"">👤 Nombre</div>
                <div class=""value"">{System.Web.HttpUtility.HtmlEncode(formData.Name)}</div>
            </div>
            <div class=""field"">
                <div class=""label"">📧 Email</div>
                <div class=""value""><a href=""mailto:{System.Web.HttpUtility.HtmlEncode(formData.Email)}"">{System.Web.HttpUtility.HtmlEncode(formData.Email)}</a></div>
            </div>
            <div class=""field"">
                <div class=""label"">📋 Asunto</div>
                <div class=""value"">{System.Web.HttpUtility.HtmlEncode(formData.Subject ?? "Sin asunto")}</div>
            </div>
            <div class=""field"">
                <div class=""label"">💬 Mensaje</div>
                <div class=""message-box"">{System.Web.HttpUtility.HtmlEncode(formData.Message).Replace("\n", "<br>")}</div>
            </div>
        </div>
        <div class=""footer"">
            Enviado desde tu portfolio • {DateTime.UtcNow:dd/MM/yyyy HH:mm} UTC
        </div>
    </div>
</body>
</html>";

            var plainTextContent = $@"
Nuevo mensaje de contacto desde tu portfolio
=============================================

Nombre: {formData.Name}
Email: {formData.Email}
Asunto: {formData.Subject ?? "Sin asunto"}

Mensaje:
{formData.Message}

---
Enviado el {DateTime.UtcNow:dd/MM/yyyy HH:mm} UTC
";

            var emailMessage = new EmailMessage(
                senderAddress: senderEmail,
                recipientAddress: recipientEmail,
                content: new EmailContent(subject)
                {
                    PlainText = plainTextContent,
                    Html = htmlContent
                });

            var emailSendOperation = await emailClient.SendAsync(Azure.WaitUntil.Started, emailMessage);
            _logger.LogInformation("Email de notificación enviado. Operation ID: {OperationId}", emailSendOperation.Id);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando email de notificación");
            return false;
        }
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email.Trim();
        }
        catch
        {
            return false;
        }
    }
}

// Modelo de datos del formulario
public class ContactFormData
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
}

// Entidad para Azure Table Storage
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