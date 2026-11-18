using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using OfflineOntologyCritic.Web;

const string DefaultBaseUrl = "https://127.0.0.1:58176";
const string DefaultSessionsRoot = @"C:\inetpub\wwwroot\matt.buffaly.local\data\sessions";
const string DefaultProject = "OpsAgent";
const string DefaultProvider = "ollama";
const string DefaultModel = "glm-5.2";
const string DefaultReasoning = "medium";

try
{
    Options o = Options.Parse(args);
    if (o.Help || string.IsNullOrWhiteSpace(o.Command)) { Help(); return o.Help ? 0 : 2; }
    using HttpClient http = NewHttp(o);
	return o.Command.ToLowerInvariant() switch
	{
		"phase1" => RetiredOfflineOntologyFlow("phase1"),
		"phase2" => RetiredOfflineOntologyFlow("phase2"),
		"feedback" => await Feedback(http, o),
		"feedback-sync" => await FeedbackSync(http, o),
		"status" => Status(o),
        "set-parent" => await SetParent(http, o),
        _ => Fail("Unknown command: " + o.Command)
    };
}
catch (Exception ex)
{
    Console.Error.WriteLine("OfflineCritic.Runner failed: " + ex.Message);
    return 1;
}

static HttpClient NewHttp(Options o)
{
	HttpClientHandler h = new() { ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator };
	return new HttpClient(h) { BaseAddress = new Uri((o.BaseUrl ?? DefaultBaseUrl).TrimEnd('/') + "/"), Timeout = TimeSpan.FromSeconds(o.TimeoutSeconds) };
}

static int RetiredOfflineOntologyFlow(string command) => Fail("OfflineCritic " + command + " was retired. Use the feedback modal workflows or the dedicated action-learning workflow instead.");

static async Task<int> Feedback(HttpClient http, Options o)
{
    string source = Req(o.Source, "--source");
    string turnKey = Req(o.TurnKey, "--turn-key");
    string reviewTarget = NormalizeReviewTarget(o.ReviewTarget);
    string reviewMode = NormalizeReviewMode(o.ReviewMode);
    if (o.DisableLevel2 == false)
        throw new ArgumentException("Feedback review profiles do not support automatic companions.");
    string feedback = string.IsNullOrWhiteSpace(o.Feedback) ? "neutral" : o.Feedback!.Trim();
    string chips = string.IsNullOrWhiteSpace(o.Chips) ? string.Empty : o.Chips!.Trim();
	string userInstruction = string.IsNullOrWhiteSpace(o.Instruction) ? string.Empty : o.Instruction!.Trim();
	string messageText = string.IsNullOrWhiteSpace(o.MessageText) ? string.Empty : o.MessageText!.Trim();
	string reviewWorkflow = string.IsNullOrWhiteSpace(o.ReviewWorkflow) ? reviewMode : o.ReviewWorkflow!.Trim();
	string requiredSkill = string.IsNullOrWhiteSpace(o.RequiredSkill) ? string.Empty : o.RequiredSkill!.Trim();
	string child = string.IsNullOrWhiteSpace(o.Child) ? DefaultFeedbackChildName(source, reviewTarget) : o.Child!;
    string artifact = FeedbackArtifact(o.SessionsRoot, child, turnKey, reviewTarget);
    if (HasUsefulArtifact(artifact))
        artifact = NextVersionedArtifactPath(artifact);
    string agentName = "buffaly-feedback-review";
    bool limited = false;
    JsonObject init = Init(o, agentName, child, source, limited: limited, useRunnerModelDefaults: false);
    JsonObject created = await PostAgentService(http, "create-child-session", new JsonObject
    {
        ["parentSessionKey"] = source, ["childSessionKey"] = child,
        ["instruction"] = string.Empty, ["timeoutSeconds"] = o.TimeoutSeconds, ["initialization"] = init
    });
    if (created["Ok"]?.GetValue<bool>() != true || created["SessionKey"]?.GetValue<string>() != child)
        throw new InvalidOperationException("Feedback child creation was rejected: " + created.ToJsonString());
	string feedbackPrompt = BuildBuffalyFeedbackReviewPrompt(source, child, turnKey, reviewMode, reviewWorkflow, requiredSkill);
    string instruction = "You are running final-response feedback review for source session `" + source + "`.\n\n"
        + "Use the full prompt below as your governing instructions. Do not call a prompt-loader action to retrieve it; it is already included here.\n\n"
        + feedbackPrompt
        + "\n\n## Runner Binding\n\n"
        + "Source session key: `" + source + "`\n"
        + "Critic session key: `" + child + "`\n"
		+ "Review target: `" + reviewTarget + "`\n"
		+ "Review mode: `" + reviewMode + "`\n"
		+ "Review workflow: `" + reviewWorkflow + "`\n"
		+ "Required skill: `" + requiredSkill + "`\n"
		+ "Automatic companions: disabled by the feedback-review profile.\n"
		+ "Selected turn key: `" + turnKey + "`\n"
		+ "Feedback: `" + feedback + "`\n"
		+ "Feedback chips: `" + chips + "`\n"
		+ "User instruction: `" + userInstruction + "`\n"
		+ "Final assistant message text supplied by the response card:\n\n```markdown\n" + messageText + "\n```\n"
		+ "Feedback review contract: return the complete feedback review markdown in your final assistant response, starting exactly with `# Offline Critic Feedback Review`.\n"
		+ "Expected artifact path: `" + artifact + "`\n"
		+ "Completion event contract: after your review artifact/final markdown is complete and before your final answer, call `ToPublishFeedbackReviewCompletedEvent` with this source session, selected turn key, review metadata, expected artifact path, and a concise result preview.\n"
		+ "Do not stop with progress only. Do not end by saying you will write the artifact later.";
    string messageKey = "feedback-" + Guid.NewGuid().ToString("N");
    // Launch means immediate delivery, not deferred QueueInput. The canonical send path starts idle workers.
    JsonObject response = await PostAgentService(http, "steer-active-input", new JsonObject
    {
        ["sessionKey"] = child,
        ["input"] = new JsonObject { ["Instruction"] = instruction, ["PromptContext"] = "CodingContext", ["MessageKey"] = messageKey }
    });
    if (response["Accepted"]?.GetValue<bool>() != true || response["MessageKey"]?.GetValue<string>() != messageKey)
        throw new InvalidOperationException("Feedback delivery admission was rejected: " + response.ToJsonString());
    OfflineCriticFeedbackLaunchResponse admission = new()
    {
        Ok = true, Status = "accepted", SourceSessionKey = source, CriticSessionKey = child,
        ArtifactPath = artifact, ReviewTarget = reviewTarget, ReviewMode = reviewMode,
        DisableLevel2AutoAttach = true, MessageKey = messageKey,
        Message = "Feedback review accepted."
    };
    string admissionJson = JsonSerializer.Serialize(admission, new JsonSerializerOptions(JsonSerializerDefaults.Web));
    if (!string.IsNullOrWhiteSpace(o.AdmissionFile))
        File.WriteAllText(o.AdmissionFile, admissionJson, Encoding.UTF8);
    Console.WriteLine(admissionJson);
    return 0;
}


static async Task<int> FeedbackSync(HttpClient http, Options o)
{
    string source = Req(o.Source, "--source");
    string child = Req(o.Child, "--child");
    string turnKey = Req(o.TurnKey, "--turn-key");
    string reviewTarget = NormalizeReviewTarget(o.ReviewTarget);
    string reviewMode = NormalizeReviewMode(o.ReviewMode);
    string reviewWorkflow = string.IsNullOrWhiteSpace(o.ReviewWorkflow) ? reviewMode : o.ReviewWorkflow!.Trim();
    string requiredSkill = string.IsNullOrWhiteSpace(o.RequiredSkill) ? string.Empty : o.RequiredSkill!.Trim();
    string artifact = string.IsNullOrWhiteSpace(o.Artifact) ? FeedbackArtifact(o.SessionsRoot, child, turnKey, reviewTarget) : o.Artifact!.Trim();
    if (!HasUsefulArtifact(artifact))
        await PersistLatestAssistantMarkdownIfNeeded(http, child, artifact, "# Offline Critic Feedback Review");
    if (!HasUsefulArtifact(artifact))
        return Fail("Feedback review artifact is not ready: " + artifact);

    string markdown = File.ReadAllText(artifact, Encoding.UTF8).Trim();
    string runId = San(Path.GetFileNameWithoutExtension(artifact));
    string eventId = "feedback-review-completed:" + San(source) + ":" + San(turnKey) + ":" + runId;
    JsonObject data = new()
    {
        ["SourceSessionKey"] = source,
        ["ChildSessionKey"] = child,
        ["TurnKey"] = turnKey,
        ["ReviewTarget"] = reviewTarget,
        ["ReviewMode"] = reviewMode,
        ["ReviewWorkflow"] = reviewWorkflow,
        ["RequiredSkill"] = requiredSkill,
        ["ArtifactPath"] = artifact,
        ["Summary"] = "Feedback review completed.",
        ["Status"] = "completed",
        ["AttentionLevel"] = "action",
        ["ResultPreview"] = Preview(markdown, 1200),
        ["CompletedUtc"] = DateTime.UtcNow.ToString("O")
    };
	JsonObject callback = new()
	{
		["EventId"] = eventId,
		["SourceSessionKey"] = source,
		["EventType"] = "FeedbackReview.Completed",
		["TurnKey"] = turnKey,
		["MessageKey"] = "feedback-review-completed-" + runId,
        ["Data"] = data
    };
	JsonObject response = await PostAgentService(http, "session-event-callback", new JsonObject { ["routingSessionKey"] = source, ["eventEnvelope"] = callback });
    Print("feedback-sync", source, child, artifact, response);
    return 0;
}
static int Status(Options o)
{
    string source = Req(o.Source, "--source");
    Console.WriteLine("Source: " + source);
    Console.WriteLine("Retired offline ontology phase commands: phase1, phase2");
    return 0;
}

static async Task<int> SetParent(HttpClient http, Options o)
{
    string child = Req(o.Child, "--child");
    string parent = Req(o.Parent ?? o.Source, "--parent");
    JsonObject response = await Post(http, "api/buffaly-agent-service/set-buffaly-session-parent", new JsonObject { ["sessionKey"] = child, ["parentSessionKey"] = parent });
    Console.WriteLine(response.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));
    return 0;
}

static JsonObject Init(Options o, string agent, string session, string parent, bool limited, bool useRunnerModelDefaults = true)
{
    JsonObject init = new() { ["AgentName"] = agent, ["ProjectName"] = o.Project ?? DefaultProject, ["SessionName"] = session, ["ParentSessionKey"] = parent };
    if (useRunnerModelDefaults || !string.IsNullOrWhiteSpace(o.Provider)) init["Provider"] = o.Provider ?? DefaultProvider;
    if (useRunnerModelDefaults || !string.IsNullOrWhiteSpace(o.Model)) init["ModelName"] = o.Model ?? DefaultModel;
    if (useRunnerModelDefaults || !string.IsNullOrWhiteSpace(o.Reasoning)) init["ReasoningLevel"] = o.Reasoning ?? DefaultReasoning;
    if (limited) { init["RootActionPrototypeName"] = "OfflineOntologyCriticActionRoot"; init["RootEntityPrototypeName"] = "OfflineOntologyCriticEntityRoot"; }
    return init;
}

static string NormalizeReviewTarget(string? value)
{
    string normalized = (value ?? string.Empty).Trim();
    if (string.IsNullOrWhiteSpace(normalized) || normalized.Equals("buffalyAgent", StringComparison.OrdinalIgnoreCase) || normalized.Equals("buffaly-agent", StringComparison.OrdinalIgnoreCase) || normalized.Equals("normal", StringComparison.OrdinalIgnoreCase))
        return "buffalyAgent";
    if (normalized.Equals("offlineCritic", StringComparison.OrdinalIgnoreCase) || normalized.Equals("offline-critic", StringComparison.OrdinalIgnoreCase))
        throw new ArgumentException("The OfflineCritic review target has been retired. Use buffalyAgent feedback workflows instead.");
    throw new ArgumentException("Unknown review target: " + value);
}

static string NormalizeReviewMode(string? value)
{
    string normalized = (value ?? string.Empty).Trim();
    if (string.IsNullOrWhiteSpace(normalized)) return "suggestion";
    if (normalized.Equals("suggestion", StringComparison.OrdinalIgnoreCase)) return "suggestion";
    if (normalized.Equals("diagnostic", StringComparison.OrdinalIgnoreCase)) return "diagnostic";
    if (normalized.Equals("materialization", StringComparison.OrdinalIgnoreCase)) return "materialization";
    if (normalized.Equals("quality", StringComparison.OrdinalIgnoreCase)) return "quality";
    throw new ArgumentException("Unknown review mode: " + value);
}

static string DefaultFeedbackChildName(string source, string reviewTarget) => source + " - buffaly feedback review";

static string BuildBuffalyFeedbackReviewPrompt(string source, string child, string turnKey, string reviewMode, string reviewWorkflow, string requiredSkill) =>
	"# Normal Buffaly Feedback Review\n\n"
	+ "You are a normal Buffaly feedback-review child, not the limited OfflineCritic agent. Use the normal Buffaly toolset available in this session.\n\n"
	+ "The user's instruction is always about the source session and selected turn key below. Before answering or making changes, use tools to inspect the session/turn evidence, relevant tool calls, artifacts, logs, source files, or ontology as needed. Do not answer from the final message text alone.\n\n"
	+ (string.IsNullOrWhiteSpace(requiredSkill) ? "No required skill was selected. Follow the user's instruction directly after inspecting evidence with tools.\n\n" : "Required skill/action: `" + requiredSkill + "`. Load or call this skill first if it is available, then use its workflow for the selected session/turn. If it is unavailable, say that explicitly and use the closest available tool-assisted path.\n\n")
	+ "Completion event requirement: before your final visible answer, call `ToPublishFeedbackReviewCompletedEvent` exactly once if it is available. Pass sourceSessionKey=`" + source + "`, turnKey=`" + turnKey + "`, artifactPath equal to the expected artifact path from the runner binding, reviewTarget=`buffalyAgent`, reviewMode=`" + reviewMode + "`, reviewWorkflow=`" + reviewWorkflow + "`, requiredSkill=`" + requiredSkill + "`, and resultPreview as a concise summary of your final review. If the tool is unavailable or fails, say so explicitly in the final answer. Do not silently skip this step.\n\n"
	+ "Source session key: `" + source + "`\n"
	+ "Review child session key: `" + child + "`\n"
	+ "Selected turn key: `" + turnKey + "`\n"
	+ "Review mode: `" + reviewMode + "`\n"
	+ "Review workflow: `" + reviewWorkflow + "`\n";

static async Task<JsonObject> PostAgentService(HttpClient http, string method, JsonObject payload) { try { return await Post(http, "api/buffaly.agent.host/buffaly-agent-service/" + method, payload); } catch (InvalidOperationException ex) when (ex.Message.Contains("HTTP 404", StringComparison.OrdinalIgnoreCase)) { return await Post(http, "api/buffaly-agent-service/" + method, payload); } }
static async Task<JsonObject> PostTurnService(HttpClient http, string method, JsonObject payload) { try { return await Post(http, "api/buffaly.agent.host/buffaly-agent-turn-service/" + method, payload); } catch (InvalidOperationException ex) when (ex.Message.Contains("HTTP 404", StringComparison.OrdinalIgnoreCase)) { return await Post(http, "api/buffaly-agent-turn-service/" + method, payload); } }
static async Task<JsonObject> Post(HttpClient http, string path, JsonObject payload) { using HttpResponseMessage r = await http.PostAsJsonAsync(path, payload); string body = await r.Content.ReadAsStringAsync(); if (!r.IsSuccessStatusCode) throw new InvalidOperationException("HTTP " + (int)r.StatusCode + " " + path + ": " + body); return JsonNode.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body) as JsonObject ?? new JsonObject { ["raw"] = body }; }
static string Root(string? s) => string.IsNullOrWhiteSpace(s) ? DefaultSessionsRoot : s!;
static string FeedbackArtifact(string? root, string child, string turnKey, string reviewTarget) => Path.Combine(Root(root), child, "artifacts", "offline-feedback-review", San(turnKey) + ".md");
static string NextVersionedArtifactPath(string artifactPath)
{
    string directory = Path.GetDirectoryName(artifactPath) ?? Environment.CurrentDirectory;
    string name = Path.GetFileNameWithoutExtension(artifactPath);
    string extension = Path.GetExtension(artifactPath);
    for (int i = 2; i < 1000; i++)
    {
        string candidate = Path.Combine(directory, name + "-" + i.ToString("000") + extension);
        if (!HasUsefulArtifact(candidate))
            return candidate;
    }
    throw new InvalidOperationException("Could not find an available feedback artifact path for " + artifactPath);
}
static async Task PersistLatestAssistantMarkdownIfNeeded(HttpClient http, string sessionKey, string artifactPath, string expectedHeaderPrefix)
{
    if (HasUsefulArtifact(artifactPath))
        return;

    JsonObject page = await PostTurnService(http, "get-session-turn-page", new JsonObject { ["sessionKey"] = sessionKey, ["skipTurns"] = 0, ["maxTurns"] = 3 });
    string? markdown = FindBestAssistantMarkdown(page, expectedHeaderPrefix);
    if (string.IsNullOrWhiteSpace(markdown))
        return;

    Directory.CreateDirectory(Path.GetDirectoryName(artifactPath) ?? Environment.CurrentDirectory);
    File.WriteAllText(artifactPath, markdown.Trim() + Environment.NewLine, Encoding.UTF8);
    Console.WriteLine("Persisted latest assistant markdown artifact: " + artifactPath);
}

static string? FindBestAssistantMarkdown(JsonNode? node, string expectedHeaderPrefix)
{
    string? best = null;
    if (node is JsonObject obj && obj["Turns"] is JsonArray turns)
    {
        foreach (JsonNode? turn in turns)
        {
            string? text = turn?["LastAssistantMessageText"]?.GetValue<string>();
            if (string.IsNullOrWhiteSpace(text))
                continue;
            string candidate = text.Trim();
            if (!LooksLikeMarkdownArtifact(candidate, expectedHeaderPrefix))
                continue;
            if (best == null || candidate.Length > best.Length)
                best = candidate;
        }
    }
    return best;
}
static bool HasUsefulArtifact(string artifactPath)
{
    if (!File.Exists(artifactPath))
        return false;
    FileInfo info = new(artifactPath);
    if (info.Length < 500)
        return false;
    string text = File.ReadAllText(artifactPath, Encoding.UTF8);
    return !text.Contains("(not run yet)", StringComparison.OrdinalIgnoreCase);
}
static bool LooksLikeMarkdownArtifact(string value, string expectedHeaderPrefix)
{
    if (value.Length < 500)
        return false;
    if (value.StartsWith(expectedHeaderPrefix, StringComparison.OrdinalIgnoreCase))
        return true;
    return value.Contains("\n## ", StringComparison.Ordinal) && value.Contains(expectedHeaderPrefix, StringComparison.OrdinalIgnoreCase);
}
static string San(string v) { StringBuilder b = new(); foreach (char c in v) b.Append(char.IsLetterOrDigit(c) ? c : '-'); return b.ToString().Trim('-'); }
static string Req(string? v, string n) => string.IsNullOrWhiteSpace(v) ? throw new ArgumentException(n + " is required") : v.Trim();
static void Print(string phase, string source, string child, string artifact, JsonObject response) { Console.WriteLine("OfflineCritic " + phase + " submitted"); Console.WriteLine("Source: " + source); Console.WriteLine("Child: " + child); Console.WriteLine("Artifact: " + artifact); Console.WriteLine(response.ToJsonString(new JsonSerializerOptions { WriteIndented = true })); }
static string Preview(string text, int maxChars) { string value = text ?? string.Empty; return value.Length <= maxChars ? value : value.Substring(0, maxChars); }
static int Fail(string m) { Console.Error.WriteLine(m); return 2; }
static void Help() { Console.WriteLine("OfflineCritic external runner. Hard rule: orchestration remains external to Buffaly-hosted tools."); Console.WriteLine("phase1 --source <sessionKey>"); Console.WriteLine("phase2 --source <sessionKey> [--phase1-artifact <path>]"); Console.WriteLine("feedback --source <sessionKey> --turn-key <turnKey> [--review-target offlineCritic|buffalyAgent] [--review-mode suggestion|diagnostic|materialization|quality] [--feedback thumbs-up|thumbs-down|neutral] [--chips <csv>] [--instruction <text>] [--message-text <markdown>]"); Console.WriteLine("status --source <sessionKey>"); Console.WriteLine("set-parent --child <sessionKey> --parent <sessionKey>"); }

sealed class Options
{
	public string? Command, Source, Parent, Child, Phase1Artifact, Artifact, BaseUrl, SessionsRoot, Project, Provider, Model, Reasoning, TurnKey, Feedback, Chips, Instruction, MessageText, ReviewTarget, ReviewMode, ReviewWorkflow, RequiredSkill, AdmissionFile;
    public int TimeoutSeconds = 1800;
    public bool? DisableLevel2;
    public bool NoVerify, Help;
    public static Options Parse(string[] a)
    {
        Options o = new(); if (a.Length == 0) { o.Help = true; return o; } o.Command = a[0];
        for (int i = 1; i < a.Length; i++)
        {
            string x = a[i];
            string N() => i + 1 < a.Length ? a[++i] : throw new ArgumentException(x + " requires value");
            switch (x)
            {
                case "--help": o.Help = true; break;
                case "--source": o.Source = N(); break;
                case "--parent": o.Parent = N(); break;
                case "--child": o.Child = N(); break;
                case "--phase1-artifact": o.Phase1Artifact = N(); break;
                case "--artifact": o.Artifact = N(); break;
                case "--admission-file": o.AdmissionFile = N(); break;
                case "--turn-key": o.TurnKey = N(); break;
                case "--feedback": o.Feedback = N(); break;
                case "--chips": o.Chips = N(); break;
                case "--instruction": o.Instruction = N(); break;
                case "--message-text": o.MessageText = N(); break;
                case "--review-target": o.ReviewTarget = N(); break;
                case "--review-mode": o.ReviewMode = N(); break;
                case "--review-workflow": o.ReviewWorkflow = N(); break;
                case "--required-skill": o.RequiredSkill = N(); break;
                case "--disable-level2": o.DisableLevel2 = bool.Parse(N()); break;
                case "--base-url": o.BaseUrl = N(); break;
                case "--sessions-root": o.SessionsRoot = N(); break;
                case "--project": o.Project = N(); break;
                case "--provider": o.Provider = N(); break;
                case "--model": o.Model = N(); break;
                case "--reasoning": o.Reasoning = N(); break;
                case "--timeout-seconds": o.TimeoutSeconds = int.Parse(N()); break;
                case "--no-verify-artifact": o.NoVerify = true; break;
                default: throw new ArgumentException("Unknown option " + x);
            }
        }
        return o;
    }
}


