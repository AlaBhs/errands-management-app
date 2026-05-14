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
    You are a senior facilities operations analyst reviewing a monthly errand management report.
    Your audience is a facilities manager who needs to act today.

    Based ONLY on the metrics below, return a JSON object with exactly this structure:
    {
      "anomalies": ["string", "string", "string"],
      "causes": ["string", "string", "string"],
      "actions": ["string", "string", "string"],
      "highlights": ["string", "string"]
    }

    - anomalies: exactly 3 strings. Flag metric outliers, imbalances between couriers,
      cost vs estimate gaps, queue bottlenecks, and workload concentration by category.
    - causes: exactly 3 strings. One hypothesis per anomaly, grounded only in the data provided.
    - actions: exactly 3 strings. Specific actions a manager can take this week.
      Include who should act and on what (e.g. courier name, category name).
    - highlights: exactly 2 strings. Positive results worth acknowledging to the team.

    Important rules for courier analysis:
    - Do NOT compare courier execution times directly as a performance indicator.
      Different couriers handle different request categories with different inherent durations.
      A courier handling Facilities requests will naturally show higher execution minutes than
      one handling Office Supplies. Only flag execution time as an anomaly if it is extreme
      relative to that courier's own assignment volume and category mix.
    - On-time rate is the most reliable courier performance indicator — flag it if below 90%.
    - Workload balance matters: flag if one courier holds more than 60% of total assignments.

    General rules:
    - Reference specific numbers from the metrics (percentages, minutes, names).
    - All monetary values are in Tunisian Dinar (TND) — always use "TND" as the currency symbol, never "$".
    - Never invent data not present in the metrics.
    - Be direct. Skip filler phrases like "it appears" or "it seems".
    - Return ONLY the JSON object, no markdown, no preamble.
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
            var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

            var body = new
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

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("X-goog-api-key", _settings.ApiKey);
            request.Content = JsonContent.Create(body);

            var response = await _httpClient.SendAsync(request, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                Console.WriteLine($"Gemini {(int)response.StatusCode}: {error}");
                return null;
            }

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

            var cleaned = rawText.Trim();
            if (cleaned.StartsWith("```"))
            {
                var firstNewline = cleaned.IndexOf('\n');
                if (firstNewline >= 0)
                    cleaned = cleaned[(firstNewline + 1)..];
                if (cleaned.EndsWith("```"))
                    cleaned = cleaned[..^3].TrimEnd();
            }

            using var _ = JsonDocument.Parse(cleaned);
            return cleaned;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Gemini failed: {ex.GetType().Name}: {ex.Message}");
            return null;
        }
    }
}
