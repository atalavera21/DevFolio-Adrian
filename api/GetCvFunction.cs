using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;
using System.Net;

namespace ContactFormAPI;

public class GetCvFunction
{
    private readonly ILogger<GetCvFunction> _logger;

    public GetCvFunction(ILogger<GetCvFunction> logger)
    {
        _logger = logger;
    }

    [Function("GetCv")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "cv")] HttpRequestData req)
    {
        _logger.LogInformation("Solicitud de descarga de CV");

        try
        {
            var connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("AzureWebJobsStorage no configurado");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteAsJsonAsync(new { error = "Configuración de storage no disponible" });
                return errorResponse;
            }

            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient("documentos");
            var blobClient = containerClient.GetBlobClient("CV_AdrianTalavera_qr.pdf");

            if (!await blobClient.ExistsAsync())
            {
                _logger.LogWarning("CV no encontrado en blob storage");
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new { error = "CV no encontrado" });
                return notFoundResponse;
            }

            var download = await blobClient.DownloadContentAsync();
            var content = download.Value.Content.ToArray();

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/pdf");
            response.Headers.Add("Content-Disposition", "inline; filename=\"CV_AdrianTalavera.pdf\"");
            response.Headers.Add("Cache-Control", "public, max-age=3600");
            
            await response.Body.WriteAsync(content);
            
            _logger.LogInformation("CV enviado correctamente");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener CV");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Error al obtener el CV" });
            return errorResponse;
        }
    }
}