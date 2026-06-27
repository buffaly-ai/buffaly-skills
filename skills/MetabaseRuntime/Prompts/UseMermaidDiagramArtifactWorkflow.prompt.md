# To create Mermaid diagrams as artifacts and launch them locally

Use this workflow to build Mermaid diagram artifacts, save them under Metabase tools, and render them through the local file-based viewer. Do not author Buffaly deep-link syntax in the prompt response; UI formatters/renderers handle Mermaid presentation.

## 1) Create the Mermaid artifact file
- Artifact folder: `C:\dev\RooTrax\RooTrax.Utilities\Metabase\wwwroot\tools`
- Recommended extension: `.mmd`
- Example artifact path:
  - `C:\dev\RooTrax\RooTrax.Utilities\Metabase\wwwroot\tools\my-diagram.mmd`

Starter template:

`erDiagram
  TABLE_A ||--o{ TABLE_B : has
  TABLE_A {
    int Id PK
    string Name
  }
  TABLE_B {
    int Id PK
    int TableAId FK
  }`

## 2) Launch local Metabase (if not already running)
Use HTTP fallback launch:

`cmd /c set ASPNETCORE_URLS=http://localhost:5197&& dotnet run --project "C:\dev\RooTrax\RooTrax.Utilities\Metabase\Metabase.csproj" --no-launch-profile`

## 3) Render by direct file URL
Open:

`http://localhost:5197/tools/mermaid-viewer.html?file=/tools/my-diagram.mmd`

Validation rules:
- `file` must start with `/`
- supported extensions: `.mmd`, `.md`, `.txt`

## 4) Render by local resolver URL
Pass the file directly to the resolver:

`http://localhost:5197/tools/mermaid-deeplink-resolver.html?file=/tools/my-diagram.mmd`

## 5) Iterate quickly
- Edit the `.mmd` artifact in source control.
- Refresh the viewer and click **Render**.
- If render fails, use the status bar parse error to fix Mermaid syntax.

## Output checklist
Return:
1. Artifact file path created/updated
2. Link used to open diagram (viewer or resolver)
3. Render status result
