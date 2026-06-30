using System.Text.Json;
using Buffaly.Agent.AudioTranscription;

static void Assert(bool condition, string name)
{
    if (!condition)
        throw new Exception("Test failed: " + name);
    Console.WriteLine("PASS " + name);
}

string temp = Path.Combine(Path.GetTempPath(), "audio-transcription-tests-" + Guid.NewGuid().ToString("N"));
Directory.CreateDirectory(temp);
try
{
    string missing = AudioArtifactTranscriptionTool.TranscribeAudioArtifact("", "");
    using (JsonDocument doc = JsonDocument.Parse(missing))
    {
        Assert(doc.RootElement.GetProperty("status").GetString() == "failed", "Empty source fails");
        Assert(doc.RootElement.GetProperty("errorCode").GetString() == "TRANSCRIBE_INPUT_REQUIRED", "Empty source error code");
    }

    string textPath = Path.Combine(temp, "not-audio.txt");
    File.WriteAllText(textPath, "this is not audio");
    string textResult = AudioArtifactTranscriptionTool.TranscribeAudioArtifact(textPath, "");
    using (JsonDocument doc = JsonDocument.Parse(textResult))
    {
        Assert(doc.RootElement.GetProperty("status").GetString() == "failed", "Unsupported extension fails");
        Assert(doc.RootElement.GetProperty("errorCode").GetString() == "TRANSCRIBE_UNSUPPORTED_AUDIO_TYPE", "Unsupported extension error code");
    }

    string wavPath = Path.Combine(temp, "tiny.wav");
    File.WriteAllBytes(wavPath, CreateTinyWav());
    string endpoint = Environment.GetEnvironmentVariable("BUFFALY_TRANSCRIBE_URL") ?? "";
    if (string.IsNullOrWhiteSpace(endpoint))
    {
        Console.WriteLine("SKIP live transcription: BUFFALY_TRANSCRIBE_URL not set.");
    }
    else
    {
        string result = AudioArtifactTranscriptionTool.TranscribeAudioArtifact(wavPath, "Transcribe the spoken words exactly.");
        Console.WriteLine(result);
        using JsonDocument doc = JsonDocument.Parse(result);
        Assert(doc.RootElement.GetProperty("status").GetString() is "ok" or "failed", "Live result has status");
        if (doc.RootElement.GetProperty("status").GetString() == "failed")
        {
            string code = doc.RootElement.GetProperty("errorCode").GetString() ?? "";
            Assert(code != "TRANSCRIBE_TOOL_ERROR", "Live failure is normalized, not tool crash");
        }
    }
}
finally
{
    Directory.Delete(temp, recursive: true);
}

static byte[] CreateTinyWav()
{
    const int sampleRate = 16000;
    const short channels = 1;
    const short bitsPerSample = 16;
    short[] samples = new short[sampleRate / 2];
    for (int i = 0; i < samples.Length; i++)
    {
        double t = i / (double)sampleRate;
        samples[i] = (short)(Math.Sin(2 * Math.PI * 440 * t) * short.MaxValue * 0.2);
    }

    using MemoryStream ms = new();
    using BinaryWriter bw = new(ms);
    int byteRate = sampleRate * channels * bitsPerSample / 8;
    short blockAlign = (short)(channels * bitsPerSample / 8);
    int dataSize = samples.Length * blockAlign;
    bw.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));
    bw.Write(36 + dataSize);
    bw.Write(System.Text.Encoding.ASCII.GetBytes("WAVE"));
    bw.Write(System.Text.Encoding.ASCII.GetBytes("fmt "));
    bw.Write(16);
    bw.Write((short)1);
    bw.Write(channels);
    bw.Write(sampleRate);
    bw.Write(byteRate);
    bw.Write(blockAlign);
    bw.Write(bitsPerSample);
    bw.Write(System.Text.Encoding.ASCII.GetBytes("data"));
    bw.Write(dataSize);
    foreach (short sample in samples)
        bw.Write(sample);
    return ms.ToArray();
}
