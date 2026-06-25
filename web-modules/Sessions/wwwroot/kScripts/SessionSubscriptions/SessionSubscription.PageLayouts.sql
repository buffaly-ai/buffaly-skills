exec dbo.InsertPageLayoutSp @Url='/session-subscriptions', 
	@Handler='/k?Output=SessionSubscriptions\SessionSubscriptions.Objects.ks.html&Class=SimpleObjectsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Session Subscriptions', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-subscription', 
	@Handler='/k?Output=SessionSubscriptions\SessionSubscription.Details.ks.html&Class=SimpleObjectDetailsPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Session Subscription', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-subscription-edit', 
	@Handler='/k?Output=SessionSubscriptions\SessionSubscription.Edit.ks.html&Class=SimpleObjectEditPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Update Session Subscription', @SiteID=1

go

exec dbo.InsertPageLayoutSp @Url='/session-subscription-insert', 
	@Handler='/k?Output=SessionSubscriptions\SessionSubscription.Insert.ks.html&Class=SimpleObjectInsertPage&Handler=Buffaly.Sessions.Web', 
	@IsEnabled=1, @PageTitle='Insert Session Subscription', @SiteID=1

go











