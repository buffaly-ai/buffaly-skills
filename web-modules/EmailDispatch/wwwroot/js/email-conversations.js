"use strict";
// Conversation navigation shares the application shell and its exact-message dispatch owner.
window.EmailConversations = (() => {
 const {$,text,escape,request,date,status,PagedGrid,CursorGrid,run,button,notify}=EmailDispatchUi;
 let threadId="", loadedThread="", selectedMessage="", bodyToken=null, version=0, canArchive=false, pendingOpen=false;
 function appendArchive(commands){
  if(!canArchive)return;
  const id=threadId;
  commands.append(button("Archive",async()=>{
   await request(EmailObservations,"ArchiveConversation",{AccountKey:"work-main",ThreadId:id});
   conversationGrid.invalidate();document.dispatchEvent(new Event("email-archive"));
   notify("Conversation archived.");
   if(threadId===id&&(location.hash==="#thread/"+encodeURIComponent(id)||location.hash.startsWith("#message/"+encodeURIComponent(id)+"/")))location.hash="#conversations";
  },!commands.querySelector(".btn-primary"),"fa-archive"));
 }
 const readers=[document.getElementById("view-email"),document.getElementById("view-message")];
 const homes=readers.map(reader=>{const marker=document.createComment("Shared message reader home");reader.before(marker);return marker;});
 function mountReaders(){readers.forEach(reader=>document.getElementById("conversation-reader").append(reader));}
 function parkReader(){document.getElementById("view-conversation").append(document.getElementById("conversation-reader"));}
 function restoreReaders(){parkReader();readers.forEach((reader,index)=>homes[index].after(reader));}
 const conversationGrid=new CursorGrid("conversations","conversation-pager","conversation-search",args=>request(EmailObservations,"GetConversations",{AccountKey:"work-main",...args}),items=>`<table class="ed-grid Grid"><thead><tr><th class="ed-sender-cell">From</th><th>Conversation</th><th class="ed-time-cell">Latest incoming</th><th class="ed-state-cell">Reply</th></tr></thead><tbody>${items.map(item=>{const [name,kind]=EmailDispatchUi.state(item.ReplyState);return `<tr data-row-href="#thread/${encodeURIComponent(item.ThreadId)}"><td class="ed-sender-cell"><span class="ed-cell-secondary" title="${escape(item.Sender)}">${escape(item.Sender)}</span></td><td><a href="#thread/${encodeURIComponent(item.ThreadId)}" title="${escape(item.Subject||"No subject")}">${escape(item.Subject||"No subject")}</a><span class="ed-cell-secondary">${item.MessageCount} ${item.MessageCount===1?"message":"messages"}</span><span class="ed-cell-secondary ed-mobile-meta">${escape(item.Sender)} · ${escape(date(item.ReceivedUtc))}</span></td><td class="ed-time-cell">${escape(date(item.ReceivedUtc))}</td><td class="ed-state-cell"><span class="ed-status ed-status-${kind}">${escape(name)}</span></td></tr>`;}).join("")}</tbody></table>`,"No conversations match. Change the search.");
 const selection=EmailDispatchUi.archiveSelection(conversationGrid,document.getElementById("conversation-commands"),item=>item.ThreadId,()=>location.hash==="#conversations",async()=>{},()=>document.dispatchEvent(new Event("email-archive")));
 const messagesGrid=new PagedGrid("thread-messages","thread-pager","conversation-search",async args=>{
  const id=threadId, current=version;
  let page=await request(EmailObservations,"GetConversation",{AccountKey:"work-main",ThreadId:id,SkipRows:args.SkipRows,NumRows:args.NumRows});
  if(current===version&&messagesGrid.skip===args.SkipRows){
   // Keep immediate newest-message opening while the server pages context oldest-first.
   if(!selectedMessage&&args.SkipRows===0&&page.HasMore){messagesGrid.skip=Math.floor((page.Conversation.MessageCount-1)/args.NumRows)*args.NumRows;page=await request(EmailObservations,"GetConversation",{AccountKey:"work-main",ThreadId:id,SkipRows:messagesGrid.skip,NumRows:args.NumRows});}
   if(current===version){canArchive=page.Conversation.CanArchive;$("thread-subject").textContent=page.Conversation.Subject||"No subject";$("thread-status").replaceChildren(status(page.Conversation.ReplyState));$("thread-context").hidden=page.Conversation.MessageCount===1;}
  }
  return page;
 },items=>`<table class="ed-grid Grid"><thead><tr><th>Messages in this conversation</th><th class="ed-time-cell">When</th></tr></thead><tbody>${items.map(item=>`<tr data-row-href="#message/${encodeURIComponent(threadId)}/${encodeURIComponent(item.MessageId)}"><td><a href="#message/${encodeURIComponent(threadId)}/${encodeURIComponent(item.MessageId)}" data-message-id="${escape(item.MessageId)}">${escape(item.Direction==="Sent"?"You sent this":item.Direction==="Draft"?"Your draft":item.Sender)}</a><span class="ed-cell-secondary">${escape(item.Subject||"No subject")}</span><span class="ed-cell-secondary ed-mobile-meta">${escape(date(item.ReceivedUtc))}</span></td><td class="ed-time-cell">${escape(date(item.ReceivedUtc))}</td></tr>`).join("")}</tbody></table>`,"No messages on this page. Return to conversations.");
 function markSelected(){parkReader();document.querySelectorAll("#thread-messages .ed-thread-open").forEach(row=>row.remove());document.querySelectorAll("#thread-messages a[data-message-id]").forEach(link=>{if(link.dataset.messageId===selectedMessage){link.setAttribute("aria-current","true");if(!$("thread-context").hidden){const row=document.createElement("tr"),cell=document.createElement("td");row.className="ed-thread-open";cell.colSpan=2;cell.append(document.getElementById("conversation-reader"));row.append(cell);link.closest("tr").after(row);}}else link.removeAttribute("aria-current");});}
 messagesGrid.OnBeforeRefresh=()=>{loadedThread="";parkReader();messagesGrid.busy(true);};
 messagesGrid.OnComplete=()=>{loadedThread=threadId;messagesGrid.busy(false);markSelected();if(!selectedMessage&&messagesGrid.page.Items.length){selectedMessage=messagesGrid.page.Items.at(-1).MessageId;pendingOpen=true;markSelected();}if(pendingOpen&&selectedMessage){pendingOpen=false;const current=version;run(null,()=>openMessage(threadId,selectedMessage,current));}};
  let show,openReview;
 EmailDispatchUi.bindEmailFrame($("message-html"),()=>bodyToken);
 async function openMessage(id,messageId,current){
   show("message");$("back-thread").href="#conversations";$("back-thread").textContent="Back to conversations";$("message-subject").textContent="Message";$("message-facts").replaceChildren();$("message-commands").replaceChildren();
  $("message-loading").textContent="Loading email…";$("message-html").hidden=true;$("message-html").removeAttribute("srcdoc");$("message-text").textContent="";$("message-text").hidden=false;
  const result=await request(EmailObservations,"GetConversationBody",{AccountKey:"work-main",ThreadId:id,MessageId:messageId});
  if(current!==version)return;
   if(result.ObservationKey){await openReview(result.ObservationKey,id,current,result);return;}
  const metadata=result.Message;$("message-subject").textContent=metadata.Subject||"No subject";$("message-facts").append(EmailDispatchUi.details([["From",metadata.Sender],["To",metadata.To],["When",date(metadata.ReceivedUtc)],["Message",metadata.Direction==="Sent"?"Sent":metadata.Direction==="Draft"?"Draft":"Received"]]));
  appendArchive($("message-commands"));
  $("message-loading").textContent="";$("message-text").textContent=result.Text||"This message has no readable text.";
  if(result.Body.HtmlDocument!==null){bodyToken=result.Body.ResizeToken;$("message-html").style.height="600px";$("message-html").srcdoc=result.Body.HtmlDocument;$("message-html").hidden=false;$("message-text").hidden=true;}
 }
  async function route(showView,openDispatch){
   show=showView;openReview=openDispatch;
   const current=++version;bodyToken=null;conversationGrid.cancelSearch();messagesGrid.cancelSearch();
  selection.clear();
  const [name,id,messageId]=location.hash.slice(1).split("/");
  if((name==="thread"||name==="message")&&id){threadId=decodeURIComponent(id);selectedMessage=name==="message"&&messageId?decodeURIComponent(messageId):"";pendingOpen=!!selectedMessage;mountReaders();show("conversation");if(name==="message"&&loadedThread===threadId){pendingOpen=false;markSelected();await openMessage(threadId,selectedMessage,current);}else{loadedThread="";canArchive=false;$("thread-subject").textContent="Conversation";$("thread-status").replaceChildren();$("thread-context").hidden=false;$("thread-messages").replaceChildren(text("p","Loading conversation…","ed-empty"));messagesGrid.reset();}}
  else{show("conversations");conversationGrid.activate(30000);}
 }
 $("conversation-search-form").addEventListener("submit",event=>{event.preventDefault();conversationGrid.reset();});
  document.addEventListener("email-archive",()=>conversationGrid.invalidate());
  return {route,appendArchive,invalidate:()=>conversationGrid.invalidate(),cancel:()=>{++version;if(!location.hash.startsWith("#message/"+encodeURIComponent(threadId)+"/"))loadedThread="";conversationGrid.cancelSearch();messagesGrid.cancelSearch();restoreReaders();},isCurrent:current=>current===version};
})();
