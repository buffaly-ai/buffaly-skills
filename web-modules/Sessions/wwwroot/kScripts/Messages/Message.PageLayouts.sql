exec dbo.InsertPageLayoutSp @Url='/messages', 
	@Handler='/k?Output=Messages\Messages.Objects.ks.html&Class=SimpleObjectsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Messages', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/message', 
	@Handler='/k?Output=Messages\Message.Details.ks.html&Class=SimpleObjectDetailsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Message', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/message-edit', 
	@Handler='/k?Output=Messages\Message.Edit.ks.html&Class=SimpleObjectEditPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Update Message', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/message-insert', 
	@Handler='/k?Output=Messages\Message.Insert.ks.html&Class=SimpleObjectInsertPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Insert Message', @SiteID=1

go











