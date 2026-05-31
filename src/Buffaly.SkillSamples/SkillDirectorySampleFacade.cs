namespace Buffaly.SkillSamples;

// Simple deterministic facade used by the Buffaly Skill Directory DLL-backed sample skill.
public static class SkillDirectorySampleFacade
{
	// Return one deterministic echo string so install/discovery can validate DLL-backed ProtoScript wiring.
	public static string Echo(string value)
	{
		return "SkillDirectorySample: " + (value ?? string.Empty);
	}
}
