using System.Net.Http.Json;
using System.Text.Json;
using ErrandsManagement.Application.Common.Settings;
using ErrandsManagement.Application.Interfaces;
using Microsoft.Extensions.Options;

namespace ErrandsManagement.Infrastructure.AI;

public sealed class GeminiOperationalAiService : IOperationalAiService
{
    private const string SystemPrompt =
        """
        You are an operations analyst for a courier errand management platform.
        Based ONLY on the metrics provided below, return a JSON object with exactly this structure:
        {
          "anomalies": ["string", "string"],
          "causes": ["string", "string"],
          "actions": ["string", "string"]
        }
        - anomalies: exactly 2 strings, each describing one metric that stands out as unusual or concerning
        - causes: exactly 2 strings, each a concise hypothesis for why the anomaly exists
        - actions: exactly 2 strings, each a specific, concrete action a manager can take today
        Rules: Be concise. Use plain language. Never invent data not present in the metrics. Return ONLY the JSON object, no markdown, no preamble.
        """;

    private readonly HttpClient _httpClient;
    private readonly GeminiSettings _settings;

    public GeminiOperationalAiService(HttpClient httpClient, IOptions<GeminiSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public async Task<string?> AnalyzeAsync(string metricsSummaryText, CancellationToken ct = default)
    {
        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_settings.ApiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = $"{SystemPrompt}\n\n{metricsSummaryText}" }
                        }
                    }
                }
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody, ct);
            if (!response.IsSuccessStatusCode)
                return null;

            var responseContent = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(responseContent);

            var rawText = doc
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(rawText))
                return null;

            // Strip markdown code fences if present
            var cleaned = rawText.Trim();
            if (cleaned.StartsWith("```"))
            {
                var firstNewline = cleaned.IndexOf('\n');
                if (firstNewline >= 0)
                    cleaned = cleaned[(firstNewline + 1)..];
                if (cleaned.EndsWith("```"))
                    cleaned = cleaned[..^3].TrimEnd();
            }

            // Validate it's parseable JSON before returning
            using var _ = JsonDocument.Parse(cleaned);
            return cleaned;
        }
        catch
        {
            return null;
        }
    }
}
