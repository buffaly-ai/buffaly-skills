exec dbo.InsertPageLayoutSp @Url='/sessions', 
	@Handler='/k?Output=Sessions\Sessions.Objects.ks.html&Class=SimpleObjectsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Sessions', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session', 
	@Handler='/k?Output=Sessions\Session.Details.ks.html&Class=SimpleObjectDetailsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Session', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-edit', 
	@Handler='/k?Output=Sessions\Session.Edit.ks.html&Class=SimpleObjectEditPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Update Session', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-insert', 
	@Handler='/k?Output=Sessions\Session.Insert.ks.html&Class=SimpleObjectInsertPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Insert Session', @SiteID=1

go











