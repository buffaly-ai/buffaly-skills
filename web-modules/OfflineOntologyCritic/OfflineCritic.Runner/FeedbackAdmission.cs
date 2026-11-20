namespace OfflineOntologyCritic.Web;

// Shared by the hosted adapter and standalone client so the requested workflow owns its identity.
public static class OfflineCriticFeedbackWorkflow
{
    public static bool IsDirect(string? workflow) => workflow == "customBuffaly";
    public static string AgentName(string? workflow) => IsDirect(workflow) ? "buffaly-agent" : "buffaly-feedback-review";
    public static string DefaultChildName(string source, string? workflow) =>
        source + (IsDirect(workflow) ? " - ask buffaly" : " - buffaly feedback review");
}

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
