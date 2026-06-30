using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Buffaly.Agent.AudioTranscription;

public static class AudioArtifactTranscriptionTool
{
    public static string TranscribeAudioArtifact(string sourceAudio, string instruction)
    {
        return AudioArtifactTranscriptionService
            .TranscribeAsync(sourceAudio, instruction, CancellationToken.None)
            .GetAwaiter()
            .GetResult();
    }
}

internal static class AudioArtifactTranscriptionService
{
    public static async Task<string> TranscribeAsync(string sourceAudio, string instruction, CancellationToken cancellationToken)
    {
        try
        {
            ResolvedAudioSource audio = await AudioSourceResolver.ResolveAsync(sourceAudio, cancellationToken).ConfigureAwait(false);
            ExistingVoiceTranscriptionGateway gateway = ExistingVoiceTranscriptionGateway.CreateDefault();
            TranscriptionGatewayResult result = await gateway.TranscribeOnlyAsync(audio, instruction, cancellationToken).ConfigureAwait(false);

            if (!result.IsSuccess)
            {
                return JsonSerializer.Serialize(new
                {
                    status = "failed",
                    errorCode = result.ErrorCode,
                    reason = result.Reason,
                    message = result.Message,
                    sourceAudio = sourceAudio,
                    endpoint = result.Endpoint,
                    httpStatus = result.HttpStatusCode
                });
            }

            return JsonSerializer.Serialize(new
            {
                status = "ok",
                transcript = result.Transcript,
                sourceAudio = sourceAudio,
                fileName = audio.FileName,
                contentType = audio.ContentType,
                endpoint = result.Endpoint
            });
        }
        catch (AudioTranscriptionException ex)
        {
            return JsonSerializer.Serialize(new
            {
                status = "failed",
                errorCode = ex.ErrorCode,
                reason = ex.Reason,
                message = ex.Message,
                sourceAudio = sourceAudio
            });
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new
            {
                status = "failed",
                errorCode = "TRANSCRIBE_TOOL_ERROR",
                reason = "tool_error",
                message = ex.Message,
                sourceAudio = sourceAudio
            });
        }
    }
}

internal sealed record ResolvedAudioSource(byte[] Bytes, string FileName, string ContentType, string OriginalSource);

internal sealed class AudioTranscriptionException : Exception
{
    public AudioTranscriptionException(string errorCode, string reason, string message) : base(message)
    {
        ErrorCode = errorCode;
        Reason = reason;
    }

    public string ErrorCode { get; }
    public string Reason { get; }
}

internal static class AudioSourceResolver
{
    private static readonly Dictionary<string, string> ContentTypesByExtension = new(StringComparer.OrdinalIgnoreCase)
    {
        [".mp3"] = "audio/mpeg",
        [".mpeg"] = "audio/mpeg",
        [".mpga"] = "audio/mpeg",
        [".wav"] = "audio/wav",
        [".m4a"] = "audio/mp4",
        [".mp4"] = "audio/mp4",
        [".aac"] = "audio/aac",
        [".flac"] = "audio/flac",
        [".ogg"] = "audio/ogg",
        [".oga"] = "audio/ogg",
        [".opus"] = "audio/opus",
        [".webm"] = "audio/webm"
    };

    public static async Task<ResolvedAudioSource> ResolveAsync(string sourceAudio, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sourceAudio))
            throw new AudioTranscriptionException("TRANSCRIBE_INPUT_REQUIRED", "input_required", "sourceAudio is required.");

        string source = ExtractFileSemanticReference(sourceAudio.Trim());
        if (Uri.TryCreate(source, UriKind.Absolute, out Uri? uri) && IsHttpUri(uri))
            return await ResolveUrlAsync(uri, sourceAudio, cancellationToken).ConfigureAwait(false);

        string path = ResolveLocalPath(source);
        if (!File.Exists(path))
            throw new AudioTranscriptionException("TRANSCRIBE_SOURCE_NOT_FOUND", "source_not_found", "Audio source file was not found: " + source);

        string extension = Path.GetExtension(path);
        string contentType = ResolveContentType(extension, null);
        byte[] bytes = await File.ReadAllBytesAsync(path, cancellationToken).ConfigureAwait(false);
        ValidateAudioCandidate(bytes, Path.GetFileName(path), contentType, extension);
        return new ResolvedAudioSource(bytes, Path.GetFileName(path), contentType, sourceAudio);
    }

    private static async Task<ResolvedAudioSource> ResolveUrlAsync(Uri uri, string originalSource, CancellationToken cancellationToken)
    {
        using HttpClient client = new() { Timeout = TimeSpan.FromMinutes(2) };
        using HttpResponseMessage response = await client.GetAsync(uri, cancellationToken).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            throw new AudioTranscriptionException(
                "TRANSCRIBE_URL_FETCH_FAILED",
                "url_fetch_failed",
                $"Audio URL fetch failed with HTTP {(int)response.StatusCode}.");
        }

        byte[] bytes = await response.Content.ReadAsByteArrayAsync(cancellationToken).ConfigureAwait(false);
        string fileName = Path.GetFileName(uri.LocalPath);
        if (string.IsNullOrWhiteSpace(fileName))
            fileName = "audio";
        string? headerContentType = response.Content.Headers.ContentType?.MediaType;
        string extension = Path.GetExtension(fileName);
        string contentType = ResolveContentType(extension, headerContentType);
        if (string.IsNullOrWhiteSpace(Path.GetExtension(fileName)))
            fileName += DefaultExtensionForContentType(contentType);
        ValidateAudioCandidate(bytes, fileName, contentType, Path.GetExtension(fileName));
        return new ResolvedAudioSource(bytes, fileName, contentType, originalSource);
    }

    private static bool IsHttpUri(Uri uri)
    {
        if (string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
            return true;

        if (!string.Equals(uri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase))
            return false;

        return string.Equals(uri.Host, "localhost", StringComparison.OrdinalIgnoreCase)
            || string.Equals(uri.Host, "127.0.0.1", StringComparison.OrdinalIgnoreCase)
            || string.Equals(uri.Host, "::1", StringComparison.OrdinalIgnoreCase);
    }

    private static string ExtractFileSemanticReference(string source)
    {
        Match match = Regex.Match(source, @"^\[\[file:(?<path>[^\]|]+)(\|[^\]]+)?\]\]$", RegexOptions.IgnoreCase);
        if (!match.Success)
            return source;
        return Uri.UnescapeDataString(match.Groups["path"].Value).Replace('/', Path.DirectorySeparatorChar);
    }

    private static string ResolveLocalPath(string source)
    {
        string expanded = Environment.ExpandEnvironmentVariables(source.Trim().Trim('"'));
        if (Path.IsPathRooted(expanded))
            return Path.GetFullPath(expanded);

        string currentDirectoryCandidate = Path.GetFullPath(Path.Combine(Environment.CurrentDirectory, expanded));
        if (File.Exists(currentDirectoryCandidate))
            return currentDirectoryCandidate;

        string? sessionRoot = Environment.GetEnvironmentVariable("OpsAgent__SessionsRootPath")
            ?? Environment.GetEnvironmentVariable("OPSAGENT_SESSIONS_ROOT")
            ?? @"C:\inetpub\wwwroot\matt.buffaly.local\data\sessions";
        string sessionCandidate = Path.GetFullPath(Path.Combine(sessionRoot, expanded));
        if (File.Exists(sessionCandidate))
            return sessionCandidate;

        string? stagingSessionRoot = @"C:\inetpub\wwwroot\staging.buffaly.local3\data\sessions";
        string stagingCandidate = Path.GetFullPath(Path.Combine(stagingSessionRoot, expanded));
        if (File.Exists(stagingCandidate))
            return stagingCandidate;

        return currentDirectoryCandidate;
    }

    private static string ResolveContentType(string extension, string? headerContentType)
    {
        if (!string.IsNullOrWhiteSpace(headerContentType) && headerContentType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase))
            return headerContentType;
        if (ContentTypesByExtension.TryGetValue(extension, out string? contentType))
            return contentType;
        throw new AudioTranscriptionException("TRANSCRIBE_UNSUPPORTED_AUDIO_TYPE", "unsupported_audio_type", "Unsupported audio extension: " + extension);
    }

    private static void ValidateAudioCandidate(byte[] bytes, string fileName, string contentType, string extension)
    {
        if (bytes.Length == 0)
            throw new AudioTranscriptionException("TRANSCRIBE_EMPTY_AUDIO", "empty_audio", "Audio source is empty.");
        if (!contentType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase))
            throw new AudioTranscriptionException("TRANSCRIBE_UNSUPPORTED_AUDIO_TYPE", "unsupported_audio_type", "Source content type is not audio: " + contentType);
        if (!ContentTypesByExtension.ContainsKey(extension))
            throw new AudioTranscriptionException("TRANSCRIBE_UNSUPPORTED_AUDIO_TYPE", "unsupported_audio_type", "Unsupported audio extension: " + extension);
        if (LooksLikePlainText(bytes))
            throw new AudioTranscriptionException("TRANSCRIBE_INVALID_AUDIO", "invalid_audio", "Source does not appear to be audio: " + fileName);
    }

    private static bool LooksLikePlainText(byte[] bytes)
    {
        int sample = Math.Min(bytes.Length, 512);
        if (sample == 0)
            return false;
        int printable = 0;
        int control = 0;
        for (int i = 0; i < sample; i++)
        {
            byte b = bytes[i];
            if (b is 9 or 10 or 13 || (b >= 32 && b <= 126))
                printable++;
            else if (b < 32)
                control++;
        }
        return sample > 32 && printable > sample * 0.92 && control == 0;
    }

    private static string DefaultExtensionForContentType(string contentType)
    {
        return contentType.ToLowerInvariant() switch
        {
            "audio/mpeg" => ".mp3",
            "audio/wav" => ".wav",
            "audio/mp4" => ".m4a",
            "audio/aac" => ".aac",
            "audio/flac" => ".flac",
            "audio/ogg" => ".ogg",
            "audio/opus" => ".opus",
            "audio/webm" => ".webm",
            _ => ".audio"
        };
    }
}

internal sealed class ExistingVoiceTranscriptionGateway
{
    private readonly IReadOnlyList<Uri> _candidateEndpoints;
    private readonly HttpMessageHandler? _handler;

    private ExistingVoiceTranscriptionGateway(IReadOnlyList<Uri> candidateEndpoints, HttpMessageHandler? handler = null)
    {
        _candidateEndpoints = candidateEndpoints;
        _handler = handler;
    }

    public static ExistingVoiceTranscriptionGateway CreateDefault()
    {
        string configured = Environment.GetEnvironmentVariable("BUFFALY_TRANSCRIBE_URL")
            ?? Environment.GetEnvironmentVariable("BUFFALY_AUDIO_TRANSCRIBE_URL")
            ?? string.Empty;

        List<Uri> candidates = new();
        if (Uri.TryCreate(configured, UriKind.Absolute, out Uri? configuredUri))
            candidates.Add(configuredUri);

        candidates.Add(new Uri("http://127.0.0.1:5016/api/transcribe"));
        candidates.Add(new Uri("http://buffaly-staging.local/api/transcribe"));
        candidates.Add(new Uri("http://127.0.0.1:5017/api/transcribe"));
        candidates.Add(new Uri("http://localhost/api/transcribe"));

        return new ExistingVoiceTranscriptionGateway(candidates.Distinct().ToArray());
    }

    public static ExistingVoiceTranscriptionGateway CreateForTests(Uri endpoint, HttpMessageHandler handler)
    {
        return new ExistingVoiceTranscriptionGateway(new[] { endpoint }, handler);
    }

    public async Task<TranscriptionGatewayResult> TranscribeOnlyAsync(ResolvedAudioSource audio, string instruction, CancellationToken cancellationToken)
    {
        TranscriptionGatewayResult? lastFailure = null;
        foreach (Uri endpoint in _candidateEndpoints)
        {
            lastFailure = await TryEndpointAsync(endpoint, audio, instruction, cancellationToken).ConfigureAwait(false);
            if (lastFailure.IsSuccess)
                return lastFailure;
            if (lastFailure.HttpStatusCode is >= 400 and < 500)
                return lastFailure;
        }

        return lastFailure ?? TranscriptionGatewayResult.Failed("TRANSCRIBE_ENDPOINT_UNAVAILABLE", "endpoint_unavailable", "No transcription endpoint candidates were available.", string.Empty, 0);
    }

    private async Task<TranscriptionGatewayResult> TryEndpointAsync(Uri endpoint, ResolvedAudioSource audio, string instruction, CancellationToken cancellationToken)
    {
        try
        {
            using HttpClient client = _handler == null ? new HttpClient() : new HttpClient(_handler, disposeHandler: false);
            client.Timeout = TimeSpan.FromMinutes(3);
            using MultipartFormDataContent multipart = new();
            ByteArrayContent fileContent = new(audio.Bytes);
            fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(audio.ContentType);
            multipart.Add(fileContent, "file", audio.FileName);
            multipart.Add(new StringContent("final"), "phase");
            if (!string.IsNullOrWhiteSpace(instruction))
                multipart.Add(new StringContent(instruction), "prompt");

            using HttpResponseMessage response = await client.PostAsync(endpoint, multipart, cancellationToken).ConfigureAwait(false);
            string body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            int statusCode = (int)response.StatusCode;
            string responseContentType = response.Content.Headers.ContentType?.MediaType ?? string.Empty;
            if (response.IsSuccessStatusCode)
            {
                string transcript = body.Trim();
                if (string.IsNullOrWhiteSpace(transcript))
                    return TranscriptionGatewayResult.Failed("TRANSCRIBE_EMPTY_TRANSCRIPT", "empty_transcript", "Transcription endpoint returned an empty transcript.", endpoint.ToString(), statusCode);
                return TranscriptionGatewayResult.Ok(transcript, endpoint.ToString(), statusCode);
            }

            (string errorCode, string reason, string message) = ParseError(body, responseContentType, response.StatusCode);
            return TranscriptionGatewayResult.Failed(errorCode, reason, message, endpoint.ToString(), statusCode);
        }
        catch (HttpRequestException ex)
        {
            return TranscriptionGatewayResult.Failed("TRANSCRIBE_ENDPOINT_UNAVAILABLE", "endpoint_unavailable", ex.Message, endpoint.ToString(), 0);
        }
        catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            return TranscriptionGatewayResult.Failed("TRANSCRIBE_ENDPOINT_TIMEOUT", "endpoint_timeout", ex.Message, endpoint.ToString(), 0);
        }
    }

    private static (string errorCode, string reason, string message) ParseError(string body, string contentType, HttpStatusCode statusCode)
    {
        if (!string.IsNullOrWhiteSpace(body) && (contentType.Contains("json", StringComparison.OrdinalIgnoreCase) || body.TrimStart().StartsWith("{")))
        {
            try
            {
                using JsonDocument doc = JsonDocument.Parse(body);
                JsonElement root = doc.RootElement;
                string errorCode = root.TryGetProperty("errorCode", out JsonElement ec) ? ec.GetString() ?? string.Empty : string.Empty;
                string reason = root.TryGetProperty("reason", out JsonElement r) ? r.GetString() ?? string.Empty : string.Empty;
                string message = root.TryGetProperty("message", out JsonElement m) ? m.GetString() ?? string.Empty : string.Empty;
                return (
                    string.IsNullOrWhiteSpace(errorCode) ? "TRANSCRIBE_ENDPOINT_ERROR" : errorCode,
                    string.IsNullOrWhiteSpace(reason) ? "endpoint_error" : reason,
                    string.IsNullOrWhiteSpace(message) ? body : message);
            }
            catch (JsonException)
            {
                // Fall through to text error.
            }
        }

        string text = string.IsNullOrWhiteSpace(body) ? "Transcription endpoint returned HTTP " + (int)statusCode + "." : body.Trim();
        return ("TRANSCRIBE_ENDPOINT_ERROR", "endpoint_error", text);
    }
}

internal sealed record TranscriptionGatewayResult(
    bool IsSuccess,
    string Transcript,
    string ErrorCode,
    string Reason,
    string Message,
    string Endpoint,
    int HttpStatusCode)
{
    public static TranscriptionGatewayResult Ok(string transcript, string endpoint, int httpStatusCode)
        => new(true, transcript, string.Empty, string.Empty, string.Empty, endpoint, httpStatusCode);

    public static TranscriptionGatewayResult Failed(string errorCode, string reason, string message, string endpoint, int httpStatusCode)
        => new(false, string.Empty, errorCode, reason, message, endpoint, httpStatusCode);
}
