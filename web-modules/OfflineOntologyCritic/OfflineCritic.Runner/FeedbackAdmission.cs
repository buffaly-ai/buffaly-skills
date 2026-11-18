namespace OfflineOntologyCritic.Web;

// Shared wire contract between the standalone runner and the hosted launch adapter.
public sealed class OfflineCriticFeedbackLaunchResponse
{
    public bool Ok { get; set; }
    public string Status { get; set; } = string.Empty;
    public string SourceSessionKey { get; set; } = string.Empty;
    public string CriticSessionKey { get; set; } = string.Empty;
    public string ArtifactPath { get; set; } = string.Empty;
    public string ReviewTarget { get; set; } = string.Empty;
    public string ReviewMode { get; set; } = string.Empty;
    public bool DisableLevel2AutoAttach { get; set; }
    public string MessageKey { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Error { get; set; } = string.Empty;

    public static OfflineCriticFeedbackLaunchResponse Fail(string error) => new()
    {
        Ok = false, Status = "failed", Error = error, Message = error
    };
}
