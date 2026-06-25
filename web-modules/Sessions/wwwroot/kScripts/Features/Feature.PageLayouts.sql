exec dbo.InsertPageLayoutSp @Url='/features', 
	@Handler='/k?Output=Features\Features.Objects.ks.html&Class=SimpleObjectsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Features', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/feature', 
	@Handler='/k?Output=Features\Feature.Details.ks.html&Class=SimpleObjectDetailsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Feature', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/feature-edit', 
	@Handler='/k?Output=Features\Feature.Edit.ks.html&Class=SimpleObjectEditPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Update Feature', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/feature-insert', 
	@Handler='/k?Output=Features\Feature.Insert.ks.html&Class=SimpleObjectInsertPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Insert Feature', @SiteID=1

go











