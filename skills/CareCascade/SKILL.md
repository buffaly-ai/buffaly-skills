# CareCascade

Matt-only CareCascade MedOnt ICD-10 API skill.

This skill is intentionally not part of shared OpsAgent content, staging, or default installers. The Matt update wrapper copies it from `C:\dev\buffaly-ai\scripts\matt-only\OpsAgent\Skills\CareCascade` after normal OpsAgent sync and ensures the Matt install `Skills/index.pts` includes it.

The skill calls the published `https://api.carecascade.com/api/buffaly.medont/icd-10-codes-service` JsonWS API and uses `CareCascade.ApiKey` from UserSecrets when a token is configured.
