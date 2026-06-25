exec dbo.InsertPageLayoutSp @Url='/session-artifacts', 
	@Handler='/k?Output=SessionArtifacts\SessionArtifacts.Objects.ks.html&Class=SimpleObjectsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Session Artifacts', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-artifact', 
	@Handler='/k?Output=SessionArtifacts\SessionArtifact.Details.ks.html&Class=SimpleObjectDetailsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Session Artifact', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-artifact-edit', 
	@Handler='/k?Output=SessionArtifacts\SessionArtifact.Edit.ks.html&Class=SimpleObjectEditPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Update Session Artifact', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-artifact-insert', 
	@Handler='/k?Output=SessionArtifacts\SessionArtifact.Insert.ks.html&Class=SimpleObjectInsertPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Insert Session Artifact', @SiteID=1

go











