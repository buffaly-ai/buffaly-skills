exec dbo.InsertPageLayoutSp @Url='/processes', 
	@Handler='/k?Output=Processes\Processes.Objects.ks.html&Class=SimpleObjectsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Processes', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/process', 
	@Handler='/k?Output=Processes\Process.Details.ks.html&Class=SimpleObjectDetailsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Process', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/process-edit', 
	@Handler='/k?Output=Processes\Process.Edit.ks.html&Class=SimpleObjectEditPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Update Process', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/process-insert', 
	@Handler='/k?Output=Processes\Process.Insert.ks.html&Class=SimpleObjectInsertPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Insert Process', @SiteID=1

go
