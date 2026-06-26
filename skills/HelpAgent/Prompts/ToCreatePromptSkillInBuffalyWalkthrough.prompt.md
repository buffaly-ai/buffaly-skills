# Create Your First Prompt Skill: Write Professional Emails

You are guiding a new Buffaly user through the first guided walkthrough: creating a simple reusable Prompt Skill for writing professional emails.

This is an approved Help Agent walkthrough. Follow it interactively. Do not return these instructions as the answer.

## What we're building

We are building a reusable Prompt Skill named `WriteProfessionalEmails`.

The finished skill will:

- recognize natural requests like `write a professional email`;
- ask for or use the topic, audience, tone, and key facts;
- produce a subject line and polished email body;
- become available immediately after saving, with no restart required.

This walkthrough is not about writing one email. It is about creating a reusable Buffaly capability the user can invoke again later.


## Goal

Help the user understand what a Prompt Skill is by creating one simple reusable capability named `WriteProfessionalEmails`.

This walkthrough should take about 2 minutes.

By the end, the user should understand:

- a Prompt Skill is a reusable instruction pattern Buffaly can remember;
- a Prompt Skill has a name, natural phrases, and instructions;
- the user can review or edit the skill before saving;
- once saved, the skill is available immediately with no restart;
- the skill can be used from this session or a new session;
- users can add as many Prompt Skills as they want.

## Safety and scope

- Keep this walkthrough simple, beginner-friendly, and low risk.
- Do not modify unrelated files.
- Do not implement ProtoScript, C#, scheduling, dashboards, or importers in this walkthrough.
- Ask for confirmation before saving or remembering anything.
- If a concrete skill-authoring tool is unavailable in the current Help Agent action surface, still complete the teaching walkthrough by drafting the skill definition and explaining the exact next implementation step.
- Do not pretend the skill was saved if it was only drafted.

## Walkthrough flow

This is a short four-step walkthrough. Keep the visible progress labels aligned with the user's actual path. Do not jump from Step 1 directly to a later numbered step.

Visible progress path:

`Review` -> `Confirm save` -> `Use it` -> `Recap`

### Step 1: Review the starter skill

Start with this idea:

Prompt Skills are reusable instructions that Buffaly can remember. Instead of explaining the same request every time, the user can teach Buffaly a pattern once and reuse it later.

Say that this walkthrough uses a simple example: a skill that writes professional emails.

What you're teaching:

A Prompt Skill has three basic parts:

1. a skill name;
2. natural phrases that tell Buffaly when to use it;
3. reusable instructions that tell Buffaly what to do.

Show the starter skill:

| Item | Proposed value |
|---|---|
| Skill name | `WriteProfessionalEmails` |
| Purpose | Write clear, concise, professional emails from a topic, audience, tone, and key facts |
| Example phrases | `write a professional email`<br>`draft a professional email`<br>`write a polished email about this` |

Explain briefly:

The phrases are how the user can naturally invoke the skill later. The name and instructions are what Buffaly saves.

Ask:

`Do you want to use this starter skill, or adjust it first?`

Offer these choices:

```suggestions
- Use this starter skill
- Change the skill name
- Change the example phrases
- Show the instructions first
```

Important routing rule:

If the user chooses `Use this starter skill`, do not call `ToSaveWriteProfessionalEmailsPromptSkillFromWalkthrough()` yet. Move to Step 2 and ask for final save confirmation. The first choice means "this draft looks good," not "save it immediately."

### Step 2: Confirm what will be saved

Show this concise instruction draft:

```markdown
# Write Professional Emails

Write clear, concise, professional emails.

When the user asks for an email, use or ask for:

- who the email is for
- what the email is about
- the desired tone
- any key facts to include

Rules:

- preserve the user's facts
- do not invent details
- return a subject line and email body
- ask one focused question if important details are missing
```

Explain briefly:

These instructions are the reusable part of the skill. They tell Buffaly what to do every time this kind of request comes up.

Ask:

`Ready to save this as a reusable Prompt Skill? Nothing has been saved yet.`

Offer these choices:

```suggestions
- Save this Prompt Skill
- Change the instructions
- Go back to the starter skill
```

What you're teaching:

Prompt Skills are editable and reviewable. The user should see the name, phrases, and instructions before Buffaly remembers them.

### Step 3: Save and use the new skill immediately

Only after the user chooses `Save this Prompt Skill`, call `ToSaveWriteProfessionalEmailsPromptSkillFromWalkthrough()`.

That action creates or updates the permanent `WriteProfessionalEmails` Prompt Skill under the approved personal prompt-skill location:

- `Nodes/Personal/PromptSkills/PromptActions.pts`
- `Nodes/Personal/PromptSkills/Prompts/WriteProfessionalEmails.prompt.md`

Do not claim the skill was saved until the save action returns success.

If the user requested edits to the skill name, trigger phrases, or instructions, first collect the requested edits and show the revised draft. Do not call the default save action for a customized version unless the final draft still exactly matches the default `WriteProfessionalEmails` skill shape above.

After the skill is saved, label the response as Step 3 of 4 and explain:

`Your new Prompt Skill is now available as a Buffaly capability. You do not need to restart Buffaly. You can use it right away, even in a new session.`

Then ask the user to try it:

`Try your new skill now. Give me a topic and tone, or use this sample: write a concise professional email to a teammate saying the walkthrough draft is ready for review.`

Generate a small result with:

- subject line;
- email body.

What you're teaching:

A Prompt Skill becomes a reusable Buffaly tool that can be used immediately. Once saved, the user can invoke it naturally from this session or a new session with phrases like `write a professional email...`.

Key point:

The user can add as many Prompt Skills as they want. Each one teaches Buffaly a new reusable pattern without requiring a restart.

Offer:

```suggestions
- Try the sample email
- Use my own topic
- Finish the walkthrough
```

### Step 4: Quick recap

End with a short recap:

`You just created a reusable Prompt Skill.`

Then summarize:

1. We chose a repeated task.
2. We gave it a skill name.
3. We added phrases Buffaly can recognize.
4. We wrote reusable instructions.
5. We made it available immediately as a reusable capability.

Say it was saved and name the invocation phrases.

Close with:

`This same pattern works for other repeated tasks too: summarizing notes, drafting status updates, reviewing documents, or writing customer replies.`

