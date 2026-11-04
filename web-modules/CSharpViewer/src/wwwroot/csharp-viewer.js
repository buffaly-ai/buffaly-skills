(() => {
  'use strict';
  // Repository Viewer client. Read-only: every API call is a GET, source text is rendered through textContent
  // (or the escaping C# highlighter) and nothing in a file is ever executed.
  const $ = id => document.getElementById(id);
  const base = '/api/web-modules/CSharpViewer/';
  const SVG = 'http://www.w3.org/2000/svg';
  const storageKeys = { width:'csharpViewer.explorerWidth', recent:'csharpViewer.recentProjects' };
  const narrow = window.matchMedia('(max-width: 760px)');
  const fileControls = ['copy-link','copy-code','line-input','go-line','wrap-code','find-in-file'];
  function escapeHtml(value){return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
  function highlight(source){let output='',index=0;const token=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|@?"(?:""|\\.|[^"\\])*"|'(?:\\.|[^'\\])+'|\b\d+(?:\.\d+)?\b|\b(?:abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|partial|private|protected|public|readonly|record|ref|required|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|var|virtual|void|volatile|while|with|yield)\b)/g;for(const match of source.matchAll(token)){output+=escapeHtml(source.slice(index,match.index));const text=match[0];let cls='kw';if(text.startsWith('//')||text.startsWith('/*'))cls='comment';else if(text.startsWith('"')||text.startsWith('@"')||text.startsWith("'"))cls='str';else if(/^\d/.test(text))cls='num';output+=`<span class="${cls}">${escapeHtml(text)}</span>`;index=match.index+text.length}return output+escapeHtml(source.slice(index))}
  const state = { scope:null, label:'', generation:0, tree:[], files:[], current:null, tabs:[], history:[], historyIndex:-1,
    searchId:0, fileId:0, treeId:0, browseId:0, mode:'files', results:[], resultIndex:0, folder:'', ready:false, treeError:'',
    matches:[], matchIndex:-1, focus:false, fullscreenOwned:false, positions:{}, repositories:[], repositoryId:0, repositoryListing:null,
    rootIds:new Set(), explorerHidden:false, drawerOpen:false, explorerWidth:280, readme:null };
  let timer, pending=0;

  // ---- Small helpers -------------------------------------------------------------------------------------------
  function store(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
  function load(key,fallback){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}}
  function status(message,error=false){ $('status').textContent=message; $('status').title=message; $('status').dataset.error=String(error); }
  function showNotice(message){$('notice-text').textContent=message;$('notice').classList.remove('hidden');}
  function hideNotice(){$('notice').classList.add('hidden');}
  function busy(delta){pending=Math.max(0,pending+delta);$('loading-bar').hidden=pending===0;}
  async function api(route,parameters={}){
    busy(1);
    try{
      const response=await fetch(base+route+'?'+new URLSearchParams(parameters),{headers:{Accept:'application/json'}});
      if(!response.ok){ const body=await response.json().catch(()=>null); throw new Error(body?.errorMessage||`Request failed (${response.status})`); }
      return await response.json();
    }finally{busy(-1);}
  }
  function report(error){status(error.message,true);showNotice(error.message);}
  // The viewport-sized workspace intentionally scrolls its panes, not the document.
  // Provide the mobile refresh gesture at a pane's top without replacing normal pan/selection.
  let pull=null,refreshing=false;
  function finishPull(reload=false){
    const gesture=pull;pull=null;if(!gesture)return;
    const current=gesture.generation===state.generation&&gesture.url===location.href;
    if(current&&reload&&!refreshing&&gesture.pane.isConnected&&gesture.pane.scrollTop===0&&$('status').textContent===gesture.message&&!document.querySelector('dialog[open]')&&!String(window.getSelection()||'')){refreshing=true;status('Refreshing\u2026');location.reload();return;}
    if(current&&gesture.message&&$('status').textContent===gesture.message)status(gesture.status,gesture.error);
  }
  document.addEventListener('touchstart',event=>{
    finishPull();
    if(refreshing||event.touches.length!==1||document.querySelector('dialog[open]')||String(window.getSelection()||''))return;
    const target=event.target instanceof Element?event.target:null;
    if(!target||target.closest('input,select,textarea,a,[contenteditable=true],button:not(.tree-row),.resizer'))return;
    const pane=target.closest('#code-wrap,#tree,#empty');
    if(!pane||pane.scrollTop>0)return;
    const touch=event.touches[0];pull={pane,id:touch.identifier,x:touch.clientX,y:touch.clientY,generation:state.generation,url:location.href,status:$('status').textContent,error:$('status').dataset.error==='true',armed:false,message:''};
  },{passive:true});
  document.addEventListener('touchmove',event=>{
    if(!pull)return;
    const gesture=pull,touch=event.touches[0];
    if(event.touches.length!==1||touch.identifier!==gesture.id||!gesture.pane.isConnected||gesture.pane.scrollTop>0||gesture.generation!==state.generation||gesture.url!==location.href||String(window.getSelection()||'')){finishPull();return;}
    const dx=touch.clientX-gesture.x,dy=touch.clientY-gesture.y;
    if(dy<0||Math.abs(dx)>Math.max(12,Math.abs(dy))){finishPull();return;}
    // Claim the first downward scroll update, even below the feedback threshold.
    // Otherwise the browser owns the sequence and later moves cannot be cancelled.
    if(dy<=0)return;
    if(!event.cancelable){finishPull();return;}
    event.preventDefault();
    gesture.armed=dy>=80;
    if(dy<12&&!gesture.message)return;
    // Do not restore an old status over a newer API/file result when a gesture is cancelled.
    if($('status').textContent!==(gesture.message||gesture.status)){finishPull();return;}
    gesture.message=gesture.armed?'Release to refresh':'Pull down to refresh';status(gesture.message);
  },{passive:false});
  document.addEventListener('touchend',event=>{if(pull)finishPull(pull.armed&&event.touches.length===0);},{passive:true});
  document.addEventListener('touchcancel',()=>finishPull(),{passive:true});
  function isCSharp(path){return /\.cs$/i.test(path);}
  function extension(path){const name=path.split('/').pop();return name.includes('.')?name.split('.').pop().toLowerCase():'';}
  function language(path){const ext=path.split('.').pop().toLowerCase();return ({cs:'C#',js:'JavaScript',cjs:'JavaScript',mjs:'JavaScript',ts:'TypeScript',tsx:'TSX',jsx:'JSX',html:'HTML',css:'CSS',json:'JSON',md:'Markdown',ps1:'PowerShell',py:'Python',sql:'SQL',pts:'ProtoScript',yml:'YAML',yaml:'YAML',xml:'XML',csproj:'MSBuild',props:'MSBuild',targets:'MSBuild',sh:'Shell'})[ext]||'Text';}
  const badgeTypes={cs:['cs','C#'],js:['js','JS'],cjs:['js','JS'],mjs:['js','JS'],jsx:['js','JSX'],ts:['ts','TS'],tsx:['ts','TSX'],json:['json','{}'],md:['md','MD'],
    html:['html','<>'],htm:['html','<>'],cshtml:['html','<>'],razor:['html','<>'],css:['css','#'],scss:['css','#'],less:['css','#'],xml:['xml','<>'],config:['xml','<>'],
    csproj:['xml','PRJ'],props:['xml','PRJ'],targets:['xml','PRJ'],sln:['cfg','SLN'],slnx:['cfg','SLN'],ps1:['ps','PS'],psm1:['ps','PS'],psd1:['ps','PS'],sh:['ps','SH'],cmd:['ps','CMD'],bat:['ps','BAT'],
    py:['py','PY'],sql:['sql','SQL'],pts:['pts','PTS'],yml:['cfg','YML'],yaml:['cfg','YML'],toml:['cfg','TOM'],ini:['cfg','INI'],env:['cfg','ENV'],gitignore:['cfg','GIT'],gitattributes:['cfg','GIT'],editorconfig:['cfg','CFG'],txt:['txt','TXT'],
    png:['bin','IMG'],jpg:['bin','IMG'],jpeg:['bin','IMG'],gif:['bin','IMG'],ico:['bin','IMG'],bmp:['bin','IMG'],webp:['bin','IMG'],svg:['xml','SVG'],dll:['bin','BIN'],exe:['bin','BIN'],pdb:['bin','BIN'],zip:['bin','ZIP'],nupkg:['bin','PKG'],pdf:['bin','PDF'],woff:['bin','FNT'],woff2:['bin','FNT'],ttf:['bin','FNT']};
  function icon(name,extra){const svg=document.createElementNS(SVG,'svg');svg.setAttribute('class','icon'+(extra?' '+extra:''));svg.setAttribute('aria-hidden','true');const use=document.createElementNS(SVG,'use');use.setAttribute('href','#'+name);svg.append(use);return svg;}
  function fileBadge(path){const ext=extension(path);const [type,label]=badgeTypes[ext]||['txt',ext?ext.slice(0,3).toUpperCase():'TXT'];const badge=document.createElement('span');badge.className='ficon';badge.dataset.type=type;badge.textContent=label;badge.setAttribute('aria-hidden','true');return badge;}
  function button(label,action){const node=document.createElement('button');node.type='button';node.textContent=label;node.addEventListener('click',action);return node;}
  function iconButton(name,label,action){const node=button('',action);node.className='icon-btn';node.setAttribute('aria-label',label);node.title=label;node.append(icon(name));return node;}
  function marked(text,query){const fragment=document.createDocumentFragment();const index=query?text.toLowerCase().indexOf(query.toLowerCase()):-1;if(index<0){fragment.append(text);return fragment;}const mark=document.createElement('mark');mark.textContent=text.slice(index,index+query.length);fragment.append(text.slice(0,index),mark,text.slice(index+query.length));return fragment;}
  function flash(id){const node=$(id),use=node.querySelector('use');node.dataset.icon??=use.getAttribute('href');use.setAttribute('href','#i-check');node.classList.add('done');clearTimeout(node.flashTimer);node.flashTimer=setTimeout(()=>{use.setAttribute('href',node.dataset.icon);node.classList.remove('done');},1200);}
  function fileParameters(path){return state.scope.sessionKey?{sessionKey:state.scope.sessionKey,path}:{rootId:state.scope.rootId,projectPath:state.scope.projectPath,path};}
  function fileRoute(){return state.scope.sessionKey?'session-file':'project-file';}
  function sameScope(a,b){return JSON.stringify(a)===JSON.stringify(b);}
  function locationRecord(path,line=1){return {path,line};}

  // ---- Explorer visibility, drawer and resizing ------------------------------------------------------------------
  function explorerVisible(){return narrow.matches?state.drawerOpen:!state.explorerHidden;}
  function syncExplorer(){
    document.body.classList.toggle('explorer-hidden',state.explorerHidden);
    document.body.classList.toggle('drawer-open',state.drawerOpen&&narrow.matches);
    $('toggle-explorer').setAttribute('aria-expanded',String(explorerVisible()));
  }
  function setDrawer(open){state.drawerOpen=open;syncExplorer();}
  function toggleExplorer(){
    if(narrow.matches)state.drawerOpen=!state.drawerOpen;else state.explorerHidden=!state.explorerHidden;
    syncExplorer();
    if(explorerVisible())($('tree').querySelector('.tree-row.active')||($('tree-filter').disabled?null:$('tree-filter')))?.focus({preventScroll:false});
  }
  function maxExplorerWidth(){return Math.max(180,Math.min(640,innerWidth-360));}
  function applyExplorerWidth(){
    const value=Math.round(Math.min(maxExplorerWidth(),Math.max(180,state.explorerWidth)));
    document.documentElement.style.setProperty('--explorer-width',value+'px');
    $('explorer-resizer').setAttribute('aria-valuenow',String(value));$('explorer-resizer').setAttribute('aria-valuemax',String(maxExplorerWidth()));
  }
  function setExplorerWidth(width,persist=true){state.explorerWidth=Math.min(640,Math.max(180,Math.round(width)));applyExplorerWidth();if(persist)store(storageKeys.width,state.explorerWidth);}

  // ---- Navigation history and deep links -------------------------------------------------------------------------
  function updateNavigation(){ $('nav-back').disabled=state.historyIndex<=0; $('nav-forward').disabled=state.historyIndex>=state.history.length-1; }
  function remember(path,line){
    const last=state.history[state.historyIndex];
    if(!last||last.path!==path||last.line!==line){state.history.splice(state.historyIndex+1);state.history.push(locationRecord(path,line));state.historyIndex=state.history.length-1;}
    updateNavigation();
  }
  function updateLink(path,line){
    const url=new URL(location.href);url.search='';
    if(state.scope.sessionKey){url.searchParams.set('sessionKey',state.scope.sessionKey);url.searchParams.set('file','artifacts/'+path);}
    else {url.searchParams.set('root',state.scope.rootId);if(state.scope.projectPath)url.searchParams.set('project',state.scope.projectPath);url.searchParams.set('file',path);}
    url.searchParams.set('line',String(line));history.replaceState(null,'',url);
  }
  function jumpTo(line,record=true){
    finishPull();
    const target=$('code').querySelector(`[data-line="${line}"]`);if(!target)return;
    $('code').querySelectorAll('.source-line.target').forEach(node=>node.classList.remove('target'));target.classList.add('target');
    // Keep inline-start alignment, then reset horizontal scroll so long lines never hide leading characters.
    target.scrollIntoView({block:'center',inline:'start'});$('code-wrap').scrollLeft=0;$('line-input').value=String(line);
    $('cursor-pos').textContent=`Ln ${line} of ${Math.max(state.current.lineCount,1)}`;
    state.positions[state.current.path]=line;if(record)remember(state.current.path,line);updateLink(state.current.path,line);
  }

  // ---- Explorer tree -----------------------------------------------------------------------------------------------
  function renderNodes(nodes,depth=0){
    const fragment=document.createDocumentFragment();
    for(const node of nodes){
      const row=button('',()=>node.kind==='directory'?toggleFolder(row):openFile(node.path).catch(report));
      row.className='tree-row';row.style.paddingLeft=`${8+depth*14}px`;row.dataset.path=node.path;row.dataset.kind=node.kind;row.setAttribute('role','treeitem');row.title=node.path;
      const name=document.createElement('span');name.className='name';name.textContent=node.name;
      if(node.kind==='directory'){const twisty=document.createElement('span');twisty.className='twisty';twisty.append(icon('i-chevron-right'));row.append(twisty,icon('i-folder','folder-icon'),name);}
      else {const spacer=document.createElement('span');spacer.className='spacer';row.append(spacer,fileBadge(node.path),name);}
      fragment.append(row);
      if(node.kind==='directory'){const group=document.createElement('div');group.setAttribute('role','group');group.dataset.path=node.path;group.dataset.depth=String(depth+1);group.hidden=true;group.style.setProperty('--guide-left',`${15+depth*14}px`);row.setAttribute('aria-expanded','false');fragment.append(group);}
    }
    return fragment;
  }
  async function loadFolder(group,offset=0){
    if(group.loading)return group.loading;
    const generation=state.generation,scope=state.scope,path=group.dataset.path||'';
    const request=(async()=>{
      group.setAttribute('aria-busy','true');
      try{
        const page=await api(scope.sessionKey?'session-entries':'project-entries',{...fileParameters(path),offset});
        if(generation!==state.generation||!group.isConnected)return;
        group.querySelector(':scope > .folder-next')?.remove();
        group.append(renderNodes(page.entries,Number(group.dataset.depth||0)));group.dataset.loaded='true';
        group.dataset.next=page.nextOffset===null?'':String(page.nextOffset);
        if(page.nextOffset!==null){const more=window.CSharpViewerCommands.commandButton('nextPage','Load more files and folders',()=>loadFolder(group,page.nextOffset).catch(error=>{if(generation===state.generation&&group.isConnected)report(error);}));more.classList.add('folder-next');group.append(more);}
        for(const file of page.entries.filter(node=>node.kind==='file'))if(!state.files.some(item=>item.path===file.path))state.files.push(file);
        if(!path)state.tree.push(...page.entries);
        $('file-count').textContent=`${state.files.length.toLocaleString()} files loaded`;
      }catch(error){
        // A failed old request is just as stale as a successful old response. Suppress it
        // here so paging and automatic ancestor reveal cannot report into another scope.
        if(generation!==state.generation||!group.isConnected)return;
        throw error;
      }finally{if(generation===state.generation&&group.isConnected){group.removeAttribute('aria-busy');group.loading=null;}}
    })();group.loading=request;return request;
  }
  async function toggleFolder(row,expanded){const generation=state.generation,group=row.nextElementSibling,open=expanded??group.hidden;group.hidden=!open;row.setAttribute('aria-expanded',String(open));if(open&&!group.dataset.loaded)try{await loadFolder(group);}catch(error){if(generation!==state.generation||!row.isConnected||!group.isConnected)return;group.hidden=true;row.setAttribute('aria-expanded','false');report(error);}}
  function folders(expanded){$('tree').querySelectorAll('[data-kind=directory]').forEach(row=>{if(!expanded||row.nextElementSibling.dataset.loaded)toggleFolder(row,expanded);});}
  function findRow(path){return [...$('tree').querySelectorAll('.tree-row')].find(item=>item.dataset.path===path);}
  function visibleRows(){return [...$('tree').querySelectorAll('.tree-row')].filter(item=>item.getClientRects().length);}
  function expandAncestors(row){let parent=row.parentElement;while(parent&&parent!==$('tree')){if(parent.getAttribute('role')==='group')toggleFolder(parent.previousElementSibling,true);parent=parent.parentElement;}}
  async function ensureRow(path){
    const generation=state.generation;let group=$('tree');const parts=path.split('/');
    for(let index=0;index<parts.length;index++){
      const part=parts.slice(0,index+1).join('/');let row=findRow(part);
      while(!row&&group.dataset.next&&generation===state.generation){await loadFolder(group,Number(group.dataset.next));row=findRow(part);}
      if(generation!==state.generation)return null;
      if(!row)return null;
      if(index===parts.length-1)return row;
      await toggleFolder(row,true);if(generation!==state.generation)return null;group=row.nextElementSibling;
    }
  }
  async function reveal(path){
    $('tree').querySelector('.active')?.classList.remove('active');
    const generation=state.generation,row=await ensureRow(path);if(!row||generation!==state.generation||state.current?.path!==path)return;
    if(row.classList.contains('filtered')){$('tree-filter').value='';filterTree();}
    expandAncestors(row);row.classList.add('active');row.scrollIntoView({block:'nearest'});
  }
  async function revealFolder(path){
    const row=await ensureRow(path);if(!row)return;
    if(row.classList.contains('filtered')){$('tree-filter').value='';filterTree();}
    expandAncestors(row);toggleFolder(row,true);
    if(narrow.matches)setDrawer(true);else if(state.explorerHidden){state.explorerHidden=false;syncExplorer();}
    row.scrollIntoView({block:'start'});row.focus({preventScroll:true});
  }
  function treeState(message,kind=''){$('tree-state').textContent=message;$('tree-state').className='tree-state'+(kind?' '+kind:'');}
  function defaultTreeState(){treeState(state.ready&&!state.tree.length?'This folder is empty or contains only excluded folders.':'');}
  // Filters in place so the folder hierarchy stays visible; collapsed state is preserved for when the filter is cleared.
  function filterTree(){
    const query=$('tree-filter').value.trim();if(!query){defaultTreeState();return;}
    $('tree-filter').value='';search('files');$('symbol-search').value=query;searchSymbols();
  }

  // ---- Outline, tabs, breadcrumb and empty state -----------------------------------------------------------------
  function fillSelect(select,items,placeholder){
    select.replaceChildren(new Option(placeholder,''));
    for(const item of items){const option=new Option(`${item.kind}  ${item.displayName}`,String(item.line));select.add(option);}
    select.disabled=items.length===0;
  }
  function selectType(){const symbol=state.current?.symbols.find(item=>String(item.line)===$('type-select').value);fillSelect($('member-select'),symbol?.members||[],'Select a member');if(symbol)jumpTo(symbol.line);}
  function renderTabs(){
    $('tabs').replaceChildren();
    for(const path of state.tabs){
      const item=document.createElement('div'),active=state.current?.path===path;item.className='file-tab';item.setAttribute('aria-current',String(active));
      const open=button('',()=>openFile(path).catch(report));open.className='tab-open';open.title=path;
      const label=document.createElement('span');label.textContent=path.split('/').pop();open.append(fileBadge(path),label);
      const close=iconButton('i-x','Close '+path,()=>closeTab(path));close.classList.add('small','tab-close');close.title='Close';
      item.addEventListener('mousedown',event=>{if(event.button===1)event.preventDefault();});
      item.addEventListener('auxclick',event=>{if(event.button===1){event.preventDefault();closeTab(path);}});
      item.append(open,close);$('tabs').append(item);
      if(active)requestAnimationFrame(()=>item.scrollIntoView({block:'nearest',inline:'nearest'}));
    }
  }
  function breadcrumbHint(text){const hint=document.createElement('span');hint.className='crumb-hint';hint.textContent=text;$('breadcrumb').replaceChildren(hint);}
  // The breadcrumb's textContent stays exactly the file path; separators are the path's own '/' characters.
  function renderBreadcrumb(path){
    const nav=$('breadcrumb'),parts=path.split('/');nav.replaceChildren();
    parts.forEach((part,index)=>{
      if(index){const sep=document.createElement('span');sep.className='sep';sep.setAttribute('aria-hidden','true');sep.textContent='/';nav.append(sep);}
      const leaf=index===parts.length-1,crumb=document.createElement(leaf?'span':'button');crumb.className='crumb'+(leaf?' leaf':'');crumb.textContent=part;
      if(leaf){crumb.setAttribute('aria-current','page');crumb.title=path;}
      else {const folder=parts.slice(0,index+1).join('/');crumb.type='button';crumb.title='Show '+folder+' in Explorer';crumb.addEventListener('click',()=>revealFolder(folder));}
      nav.append(crumb);
    });
  }
  function recentProjects(){const list=load(storageKeys.recent,[]);return Array.isArray(list)?list.filter(item=>item&&typeof item.rootId==='string'&&typeof item.label==='string'&&typeof item.projectPath==='string'&&state.rootIds.has(item.rootId)):[];}
  function rememberRecent(scope,label){
    let list=load(storageKeys.recent,[]);if(!Array.isArray(list))list=[];
    list=list.filter(item=>!(item&&item.rootId===scope.rootId&&item.projectPath===(scope.projectPath||'')));
    list.unshift({rootId:scope.rootId,projectPath:scope.projectPath||'',label});store(storageKeys.recent,list.slice(0,8));
  }
  function renderRecent(listId,containerId){
    const current=state.scope&&!state.scope.sessionKey?state.scope:null;
    const items=recentProjects().filter(item=>!(current&&item.rootId===current.rootId&&item.projectPath===(current.projectPath||''))).slice(0,5);
    $(listId).replaceChildren();
    for(const item of items){const li=document.createElement('li'),text=document.createElement('span');text.textContent=item.label;
      const action=button('',()=>openScope({rootId:item.rootId,projectPath:item.projectPath},item.label).catch(report));action.title=item.label;action.append(icon('i-clock'),text);li.append(action);$(listId).append(li);}
    $(containerId).classList.toggle('hidden',!items.length);
  }
  function renderEmpty(){
    const scope=state.scope,ready=!!scope&&state.ready,hasFiles=ready&&state.tree.length>0;
    $('empty-title').textContent=scope?state.label:'Open a repository';
    $('empty-text').textContent=!scope?'Read local GitHub checkouts on this server. Nothing is edited, built or run.':state.treeError||(!state.ready?'Loading files\u2026':hasFiles?'Choose a folder in Explorer or find a file by name.':'This folder is empty or contains only excluded folders.');
    const readme=hasFiles?state.files.find(file=>/^readme(\.[a-z0-9]+)?$/i.test(file.path)):null;state.readme=readme?readme.path:null;
    $('empty-open').className=hasFiles?'secondary':'primary';
    $('empty-find').classList.toggle('hidden',!hasFiles);$('empty-readme').classList.toggle('hidden',!readme);
    if(scope)$('empty-recent').classList.add('hidden');else renderRecent('empty-recent-list','empty-recent');
  }
  function clearFile(){
    state.current=null;$('code').replaceChildren();$('lines').textContent='';breadcrumbHint(state.scope?'No file open':'Open a project to begin');$('metadata').textContent='READ ONLY';
    $('file-kind').classList.add('hidden');$('outline').classList.add('hidden');$('cursor-pos').textContent='';
    $('empty').classList.remove('hidden');$('code-wrap').classList.add('hidden');
    fillSelect($('type-select'),[],'Select a file');fillSelect($('member-select'),[],'Select a type');
    for(const id of fileControls)$(id).disabled=true;
    $('file-find').classList.add('hidden');state.matches=[];state.matchIndex=-1;renderEmpty();
  }
  function closeTab(path){
    state.tabs=state.tabs.filter(item=>item!==path);
    if(state.current?.path===path){state.fileId++;if(state.tabs.length)openFile(state.tabs[state.tabs.length-1]).catch(report);else {clearFile();renderTabs();}}
    else renderTabs();
  }

  // ---- Files and projects ----------------------------------------------------------------------------------------
  async function openFile(path,line=null,record=true){
    line=line??state.positions[path]??1;
    const generation=state.generation,id=++state.fileId;status('Reading '+path.split('/').pop()+'\u2026');
    try{
      const file=await api(fileRoute(),fileParameters(path));if(generation!==state.generation||id!==state.fileId)return;
      const csharp=isCSharp(file.path);
      state.current=file;if(!state.tabs.includes(path))state.tabs.push(path);
      const fragment=document.createDocumentFragment();
      file.content.split('\n').forEach((value,index)=>{const span=document.createElement('span');span.className='source-line';span.dataset.line=String(index+1);if(csharp)span.innerHTML=highlight(value)||' ';else span.textContent=value||' ';fragment.append(span);});
      $('code').replaceChildren(fragment);
      $('lines').textContent=Array.from({length:Math.max(file.lineCount,1)},(_,index)=>index+1).join('\n');
      renderBreadcrumb(file.path);
      $('metadata').textContent=`READ ONLY \u00b7 ${language(file.path)}${csharp?'':' (plain text)'} \u00b7 ${file.lineCount.toLocaleString()} lines \u00b7 ${file.size.toLocaleString()} bytes`;
      const kind=$('file-kind');kind.textContent=csharp?'C#':language(file.path)+' \u00b7 plain text';kind.className='kind-chip'+(csharp?' cs':'');
      kind.title=csharp?'C# source with highlighting and type/member navigation':'Shown as literal plain text; never rendered or executed. C# navigation is unavailable.';
      $('outline').classList.toggle('hidden',!csharp);
      fillSelect($('type-select'),file.symbols||[],csharp?'Select a type':'C# files only');fillSelect($('member-select'),[],csharp?'Select a type':'C# files only');
      $('empty').classList.add('hidden');$('code-wrap').classList.remove('hidden');
      for(const control of fileControls)$(control).disabled=false;
      state.matches=[];state.matchIndex=-1;$('file-query').value='';$('match-count').textContent='';
      hideNotice();if(narrow.matches&&state.drawerOpen)setDrawer(false);
      renderTabs();jumpTo(Math.min(Math.max(line,1),Math.max(file.lineCount,1)),record);status('Loaded '+file.name);reveal(path).catch(report);
    }catch(error){if(generation===state.generation&&id===state.fileId)report(error);}
  }
  async function navigateHistory(delta){
    const next=state.historyIndex+delta;if(next<0||next>=state.history.length)return;
    state.historyIndex=next;updateNavigation();const item=state.history[next];await openFile(item.path,item.line,false);
  }
  async function openScope(scope,label,initial=null){
    finishPull();
    if(sameScope(scope,state.scope)&&state.ready&&!initial){$('project-dialog').close();return;}
    const url=new URL(location.href);url.search='';
    if(scope.sessionKey)url.searchParams.set('sessionKey',scope.sessionKey);
    else {url.searchParams.set('root',scope.rootId);if(scope.projectPath)url.searchParams.set('project',scope.projectPath);}
    history.replaceState(null,'',url);
    state.scope=scope;state.label=label;state.generation++;state.fileId++;state.searchId++;state.treeId++;state.ready=false;state.treeError='';
    state.tabs=[];state.history=[];state.historyIndex=-1;state.tree=[];state.files=[];state.positions={};hideNotice();clearFile();renderTabs();updateNavigation();
    $('tree').replaceChildren();$('tree').loading=null;delete $('tree').dataset.loaded;delete $('tree').dataset.next;$('tree').dataset.path='';$('tree').dataset.depth='0';$('tree').classList.remove('filtering');$('tree-filter').value='';$('tree-filter').placeholder='Find a file in this project';$('tree-filter').disabled=true;treeState('Loading files\u2026','loading');
    $('file-count').textContent='';$('project-name').textContent=label;$('open-project').title=label+' \u2014 open another project';$('project-dialog').close();
    if($('search-dialog').open)$('search-dialog').close();$('symbol-results').replaceChildren();$('symbol-search').value='';
    for(const id of ['quick-open','find-symbol','collapse-all','expand-all'])$(id).disabled=true;
    $('focus-code').disabled=false;$('full-screen').disabled=!document.documentElement.requestFullscreen;
    const generation=state.generation,treeId=state.treeId;status('Loading project\u2026');
    try{
      await loadFolder($('tree'));
      if(generation!==state.generation||treeId!==state.treeId)return;
      state.ready=true;
      defaultTreeState();$('tree-filter').disabled=false;
      for(const id of ['quick-open','collapse-all','expand-all'])$(id).disabled=false;$('find-symbol').disabled=!!scope.sessionKey;$('find-symbol').title=scope.sessionKey?'Symbol search is unavailable for session artifacts. Find file and Find text still work.':'Find C# type or member (Ctrl Shift P). Find file supports every file type.';
      status(state.tree.length?'Project ready.':'This folder is empty or contains only excluded folders.');
      if(!scope.sessionKey)rememberRecent(scope,label);
      renderEmpty();
      if(initial)await openFile(initial.path,initial.line);
      else if(narrow.matches&&state.tree.length)setDrawer(true);
    }catch(error){if(generation===state.generation){report(error);state.treeError=error.message;treeState(error.message,'error');renderEmpty();}}
  }

  // ---- Project picker ---------------------------------------------------------------------------------------------
  function picker(){
    if(!$('root-select').options.length){report(new Error('No approved source locations. Ask an administrator to configure CSHARP_VIEWER_ROOTS.'));return;}
    if(!$('project-dialog').open)$('project-dialog').showModal();state.folder=state.scope?.sessionKey?'':state.scope?.projectPath||'';
    if(state.scope?.rootId)$('root-select').value=state.scope.rootId;
    renderRecent('picker-recent-list','picker-recent');
    pickerMode('repositories');loadRepositories();
    if(!narrow.matches)$('repository-filter').focus();
  }
  function pickerMode(mode){
    const repositories=mode==='repositories';
    $('repository-picker').classList.toggle('hidden',!repositories);$('folder-picker').classList.toggle('hidden',repositories);
    $('show-repositories').setAttribute('aria-pressed',String(repositories));$('show-folders').setAttribute('aria-pressed',String(!repositories));
    if(!repositories)browse(state.folder);
  }
  function renderRepositories(){
    const query=$('repository-filter').value.trim().toLowerCase();$('repositories').replaceChildren();
    const matches=state.repositories.filter(repo=>(repo.fullName+' '+repo.localPath).toLowerCase().includes(query));
    for(const repo of matches){
      const row=document.createElement('li'),avatar=document.createElement('span'),info=document.createElement('div'),name=document.createElement('strong'),path=document.createElement('small'),actions=document.createElement('div');
      const parts=repo.fullName.split('/'),owner=parts.length>1?parts.slice(0,-1).join('/'):'',repository=parts[parts.length-1];
      row.className='repo';avatar.className='avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent=(owner||repository||'?').slice(0,1);
      info.className='repo-info';if(owner){const strong=document.createElement('b');strong.textContent=repository;name.append(owner+'/',strong);}else name.textContent=repo.fullName;
      path.textContent=repo.localPath;path.className='repository-path';path.title=repo.localPath;info.append(name,path);
      const browseButton=iconButton('i-folder-tree','Browse subfolders',()=>{$('root-select').value=repo.rootId;state.folder=repo.projectPath;pickerMode('folders');});
      const openButton=button('Open',()=>openScope({rootId:repo.rootId,projectPath:repo.projectPath},repo.fullName).catch(report));openButton.className='primary';openButton.setAttribute('aria-label','Open repository');openButton.title='Open '+repo.fullName;
      actions.className='repo-actions';actions.append(browseButton,openButton);
      row.addEventListener('dblclick',event=>{if(!event.target.closest('button'))openButton.click();});
      row.append(avatar,info,actions);$('repositories').append(row);
    }
    const listing=state.repositoryListing;if(!listing)return;
    const warnings=(listing.truncated?' Discovery limit reached; browse folders or configure a narrower source location.':'')+
      (listing.unavailable?' Some folders or Git metadata could not be read safely.':'');
    $('repository-status').textContent=(matches.length?`${matches.length} of ${state.repositories.length} local GitHub checkouts.`:
      state.repositories.length?'No repositories match this filter.':'No local GitHub checkouts found. Use Browse folders or add an approved source location.')+warnings;
  }
  async function loadRepositories(){
    const id=++state.repositoryId;state.repositoryListing=null;state.repositories=[];$('repositories').replaceChildren();$('repository-status').textContent='Discovering local GitHub checkouts\u2026';
    try{const result=await api('repositories');if(id!==state.repositoryId||!$('project-dialog').open)return;
      state.repositories=result.repositories;state.repositoryListing=result;renderRepositories();
    }catch(error){if(id===state.repositoryId&&$('project-dialog').open)$('repository-status').textContent='Could not list local repositories: '+error.message+' Use Browse folders or refresh to retry.';}
  }
  async function browse(path){
    const id=++state.browseId,rootId=$('root-select').value;$('choose-folder').disabled=true;$('folders').replaceChildren();$('folder-status').textContent='Loading folders\u2026';
    try{
      const result=await api('project-folders',{rootId,path});if(id!==state.browseId)return;
      state.folder=result.path;$('folder-path').textContent=result.path||'(source location)';$('folder-path').title=result.path||'';$('folder-up').disabled=!result.path;
      for(const folder of result.folders){const li=document.createElement('li'),text=document.createElement('span');text.textContent=folder.name+' /';const action=button('',()=>browse(folder.path));action.append(icon('i-folder'),text);li.append(action);$('folders').append(li);}
      $('project-definitions').textContent=result.definitions.length?'Project definitions: '+result.definitions.join(', '):'No .sln, .slnx or .csproj at this level. You can still open this source folder.';
      $('folder-status').textContent=result.truncated?'Listing limited to 500 folders / 100 project definitions. Choose a narrower approved source location.':result.folders.length?'Choose a subfolder, or open this folder.':'No subfolders.';
      $('choose-folder').disabled=false;
    }catch(error){if(id===state.browseId)$('folder-status').textContent=error.message;}
  }

  // ---- Search palette ---------------------------------------------------------------------------------------------
  function setSearchMode(mode){
    const files=mode==='files';
    $('search-title').textContent=files?'Find file':'Find type or member';$('search-label').textContent=files?'File name or path':'Type or member name';
    $('symbol-search').placeholder=files?'Search files by name or path':'Search C# types and members';
    $('search-mode-files').setAttribute('aria-pressed',String(files));$('search-mode-symbols').setAttribute('aria-pressed',String(!files));
    $('search-mode-symbols').disabled=!!state.scope?.sessionKey;$('search-mode-symbols').title=state.scope?.sessionKey?'Symbol search is unavailable for session artifacts.':'Ctrl Shift P';
  }
  function search(mode){
    if(mode==='symbols'&&state.scope?.sessionKey)mode='files';
    state.mode=mode;state.searchId++;state.results=[];$('symbol-results').replaceChildren();$('symbol-search').value='';setSearchMode(mode);
    $('search-status').textContent=mode==='files'?'Start typing a file name.':'Enter at least two characters.';if(!$('search-dialog').open)$('search-dialog').showModal();$('symbol-search').focus();
  }
  function switchSearchMode(mode){if(mode===state.mode)return;const query=$('symbol-search').value;search(mode);$('symbol-search').value=query;if(query.trim()){clearTimeout(timer);searchSymbols();}}
  function renderResults(){
    $('symbol-results').replaceChildren();const query=$('symbol-search').value.trim();
    for(const [index,result] of state.results.entries()){
      const li=document.createElement('li');const action=button('',()=>openSearchResult(index));action.setAttribute('aria-current',String(index===state.resultIndex));
      if(result.kind){const kind=document.createElement('span');kind.className='kind';kind.textContent=result.kind;action.append(kind);}else action.append(fileBadge(result.path));
      const label=document.createElement('span');label.className='result-label';label.append(marked(result.label,query));
      const detail=document.createElement('small');detail.textContent=result.detail;action.append(label,detail);li.append(action);$('symbol-results').append(li);
    }
    $('symbol-results').querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'});
    $('search-status').textContent=state.results.length?`${state.results.length} matches${state.results.length===100?' (first 100)':''}. Use Up/Down and Enter, or click a result.`:'No matches.';
  }
  async function searchSymbols(){
    const query=$('symbol-search').value.trim(),id=++state.searchId,generation=state.generation;
    state.results=[];$('symbol-results').replaceChildren();
    if(query.length<(state.mode==='files'?1:2)){$('search-status').textContent=state.mode==='files'?'Start typing a file name.':'Enter at least two characters.';return;}
    $('search-status').textContent='Searching\u2026';
    try{
      let results,truncated=false;
      if(state.mode==='files'){
        const listing=await api(state.scope.sessionKey?'session-files':'project-files',{...fileParameters(''),query});
        results=listing.matches.map(file=>({path:file.path,line:1,label:file.name,detail:file.path}));truncated=listing.truncated;
      }else results=(await api('project-symbols',{rootId:state.scope.rootId,projectPath:state.scope.projectPath,query})).map(result=>({path:result.filePath,line:result.line,kind:result.kind,label:result.displayName,detail:`${result.filePath}:${result.line}`}));
      if(id!==state.searchId||generation!==state.generation)return;state.results=results;state.resultIndex=0;renderResults();if(truncated)$('search-status').textContent='Showing a limited set of matches. Refine the file name to narrow the search.';
    }catch(error){if(id===state.searchId&&generation===state.generation)$('search-status').textContent=error.message;}
  }
  async function openSearchResult(index){const result=state.results[index];if(!result)return;$('search-dialog').close();state.searchId++;await openFile(result.path,result.line);}

  // ---- Focus, full screen and find ------------------------------------------------------------------------------
  function setFocus(value){state.focus=value;document.body.classList.toggle('focus-code',value);$('focus-code').setAttribute('aria-pressed',String(value));$('exit-focus').classList.toggle('hidden',!value);if(value){if(state.drawerOpen)setDrawer(false);$('code-wrap').focus();}else $('focus-code').focus();}
  async function fullscreen(){
    try{
      if(document.fullscreenElement){await document.exitFullscreen();return;}
      if(!document.documentElement.requestFullscreen)throw new Error('Full screen is unavailable in this browser. Focus code is still available.');
      await document.documentElement.requestFullscreen();state.fullscreenOwned=!state.focus;setFocus(true);
    }catch(error){status('Full screen was not granted by the browser. Use Focus code, or enable full-screen access and try again.',true);}
  }
  function findText(direction=1){
    const query=$('file-query').value;if(!state.current||!query)return;
    const lines=state.current.content.split('\n');state.matches=lines.flatMap((text,index)=>text.toLowerCase().includes(query.toLowerCase())?[index+1]:[]);
    $('code').querySelectorAll('.match').forEach(node=>node.classList.remove('match'));
    for(const line of state.matches)$('code').querySelector(`[data-line="${line}"]`).classList.add('match');
    if(!state.matches.length){$('match-count').textContent='No matching lines';state.matchIndex=-1;return;}
    state.matchIndex=(state.matchIndex+direction+state.matches.length)%state.matches.length;jumpTo(state.matches[state.matchIndex]);
    $('match-count').textContent=`${state.matchIndex+1} / ${state.matches.length} matching lines`;
  }
  function showFind(){
    const selection=String(window.getSelection()||'').trim();if(selection&&!selection.includes('\n')&&selection.length<200)$('file-query').value=selection;
    $('file-find').classList.remove('hidden');$('file-query').focus();$('file-query').select();
  }
  function closeFind(){$('file-find').classList.add('hidden');$('code').querySelectorAll('.match').forEach(node=>node.classList.remove('match'));$('code-wrap').focus();}
  function openShortcuts(){if(!$('shortcuts-dialog').open)$('shortcuts-dialog').showModal();}

  // ---- Wiring -----------------------------------------------------------------------------------------------------
  $('open-project').onclick=picker;$('empty-open').onclick=picker;$('empty-find').onclick=()=>search('files');$('empty-readme').onclick=()=>{if(state.readme)openFile(state.readme).catch(report);};
  $('toggle-explorer').onclick=toggleExplorer;$('scrim').onclick=()=>setDrawer(false);$('show-shortcuts').onclick=openShortcuts;$('notice-close').onclick=hideNotice;
  narrow.addEventListener('change',()=>{document.body.classList.add('layout-switching');state.drawerOpen=false;syncExplorer();requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.remove('layout-switching')));});
  window.addEventListener('resize',applyExplorerWidth);
  const resizer=$('explorer-resizer');
  resizer.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;event.preventDefault();resizer.setPointerCapture(event.pointerId);resizer.classList.add('dragging');document.body.classList.add('resizing');
    const start=event.clientX,width=$('explorer').getBoundingClientRect().width;
    const move=moveEvent=>{state.explorerWidth=Math.min(640,Math.max(180,Math.round(width+moveEvent.clientX-start)));applyExplorerWidth();};
    const up=()=>{resizer.removeEventListener('pointermove',move);resizer.removeEventListener('pointerup',up);resizer.removeEventListener('pointercancel',up);resizer.classList.remove('dragging');document.body.classList.remove('resizing');setExplorerWidth($('explorer').getBoundingClientRect().width);};
    resizer.addEventListener('pointermove',move);resizer.addEventListener('pointerup',up);resizer.addEventListener('pointercancel',up);
  });
  resizer.addEventListener('dblclick',()=>setExplorerWidth(280));
  resizer.addEventListener('keydown',event=>{
    const step=event.shiftKey?64:16,current=$('explorer').getBoundingClientRect().width;let width=null;
    if(event.key==='ArrowLeft')width=current-step;else if(event.key==='ArrowRight')width=current+step;else if(event.key==='Home')width=180;else if(event.key==='End')width=maxExplorerWidth();else if(event.key==='Enter')width=280;
    if(width!==null){event.preventDefault();setExplorerWidth(width);}
  });
  $('show-repositories').onclick=()=>pickerMode('repositories');$('show-folders').onclick=()=>pickerMode('folders');
  $('refresh-repositories').onclick=loadRepositories;$('repository-filter').oninput=renderRepositories;
  $('repository-filter').addEventListener('keydown',event=>{
    if(event.key==='Enter'){const first=$('repositories').querySelector('.repo-actions .primary');if(first){event.preventDefault();first.click();}}
    if(event.key==='ArrowDown'){const first=$('repositories').querySelector('.repo-actions .primary');if(first){event.preventDefault();first.focus();}}
  });
  $('project-dialog').addEventListener('close',()=>{state.repositoryId++;state.browseId++;});
  $('root-select').onchange=()=>browse('');$('folder-up').onclick=()=>browse(state.folder.split('/').slice(0,-1).join('/'));
  $('choose-folder').onclick=()=>{const rootId=$('root-select').value;const name=$('root-select').selectedOptions[0].textContent.split(' \u2014 ')[0];openScope({rootId,projectPath:state.folder},name+(state.folder?' / '+state.folder:''));};
  $('collapse-all').onclick=()=>folders(false);$('expand-all').onclick=()=>folders(true);
  $('tree-filter').addEventListener('keydown',event=>{
    if(event.key==='Escape'&&$('tree-filter').value){event.preventDefault();event.stopPropagation();$('tree-filter').value='';filterTree();}
    else if(event.key==='ArrowDown'){event.preventDefault();visibleRows()[0]?.focus();}
    else if(event.key==='Enter'){event.preventDefault();filterTree();}
  });
  $('tree').addEventListener('keydown',event=>{
    const row=event.target.closest('.tree-row');if(!row)return;
    const rows=visibleRows();
    const index=rows.indexOf(row);
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();rows[Math.min(rows.length-1,Math.max(0,index+(event.key==='ArrowDown'?1:-1)))]?.focus();}
    if(event.key==='Home'||event.key==='End'){event.preventDefault();(event.key==='Home'?rows[0]:rows[rows.length-1])?.focus();}
    if(event.key==='ArrowRight'&&row.dataset.kind==='directory'){event.preventDefault();toggleFolder(row,true).then(()=>row.nextElementSibling.querySelector('.tree-row:not(.filtered)')?.focus());}
    if(event.key==='ArrowLeft'){event.preventDefault();if(row.dataset.kind==='directory'&&row.getAttribute('aria-expanded')==='true')toggleFolder(row,false);else if(row.parentElement.getAttribute('role')==='group')row.parentElement.previousElementSibling.focus();}
  });
  $('quick-open').onclick=()=>search('files');$('find-symbol').onclick=()=>search('symbols');
  $('search-mode-files').onclick=()=>switchSearchMode('files');$('search-mode-symbols').onclick=()=>switchSearchMode('symbols');
  $('symbol-search').oninput=()=>{clearTimeout(timer);state.searchId++;state.results=[];$('symbol-results').replaceChildren();timer=setTimeout(searchSymbols,state.mode==='files'?60:250);};
  $('symbol-search').onkeydown=event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(state.results.length){state.resultIndex=(state.resultIndex+(event.key==='ArrowDown'?1:-1)+state.results.length)%state.results.length;renderResults();}}
    if(event.key==='Enter'){event.preventDefault();if(state.results.length)openSearchResult(state.resultIndex);else {clearTimeout(timer);searchSymbols();}}
  };
  $('search-dialog').addEventListener('close',()=>{state.searchId++;clearTimeout(timer);});
  $('type-select').onchange=selectType;$('member-select').onchange=()=>{if($('member-select').value)jumpTo(Number($('member-select').value));};
  $('nav-back').onclick=()=>navigateHistory(-1);$('nav-forward').onclick=()=>navigateHistory(1);
  $('go-line').onclick=()=>{const line=Number($('line-input').value);if(Number.isInteger(line)&&line>=1&&line<=Math.max(state.current.lineCount,1))jumpTo(line);else status('Enter a line inside this file.',true);};
  $('line-input').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();$('go-line').click();}});
  $('lines').addEventListener('click',event=>{
    if(!state.current)return;const gutter=$('lines'),style=getComputedStyle(gutter);
    const line=Math.floor((event.clientY-gutter.getBoundingClientRect().top-parseFloat(style.paddingTop))/parseFloat(style.lineHeight))+1;
    if(line>=1&&line<=Math.max(state.current.lineCount,1)){jumpTo(line);status(`Line ${line} selected. The address now links to it.`);}
  });
  $('focus-code').onclick=()=>setFocus(!state.focus);$('exit-focus').onclick=async()=>{if(document.fullscreenElement)await document.exitFullscreen();setFocus(false);};$('full-screen').onclick=fullscreen;
  document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement,label=active?'Exit full screen':'Full screen';$('full-screen').setAttribute('aria-label',label);$('full-screen').title=label;$('full-screen-icon').setAttribute('href',active?'#i-minimize':'#i-maximize');if(!active&&state.fullscreenOwned)setFocus(false);});
  $('wrap-code').onclick=()=>{const active=document.body.classList.toggle('wrap');$('wrap-code').setAttribute('aria-pressed',String(active));status(active?'Line wrapping on; line-number gutter hidden to avoid misaligned numbers.':'Line wrapping off.');};
  $('find-in-file').onclick=showFind;$('file-find').onsubmit=event=>{event.preventDefault();findText();};$('previous-match').onclick=()=>findText(-1);
  $('file-query').oninput=()=>{state.matchIndex=-1;};$('close-find').onclick=closeFind;
  $('file-query').addEventListener('keydown',event=>{if(event.key==='Enter'&&event.shiftKey){event.preventDefault();findText(-1);}});
  $('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);status('Code location link copied.');flash('copy-link');}catch{status('Clipboard unavailable. Copy the address from the browser.',true);}};
  $('copy-code').onclick=async()=>{try{await navigator.clipboard.writeText(state.current.content);status('Current file copied.');flash('copy-code');}catch{status('Clipboard unavailable. Select code and copy it.',true);}};
  const dialogs=['shortcuts-dialog','search-dialog','project-dialog'];
  document.addEventListener('keydown',event=>{
    const modifier=event.ctrlKey||event.metaKey,key=event.key.toLowerCase(),typing=/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName);
    if(event.key==='Escape'){
      const dialog=dialogs.map($).find(item=>item.open);
      if(dialog){event.preventDefault();dialog.close();return;}
      if(!$('file-find').classList.contains('hidden')&&$('file-find').contains(document.activeElement)){event.preventDefault();closeFind();return;}
      if(state.drawerOpen&&narrow.matches){event.preventDefault();setDrawer(false);$('toggle-explorer').focus();return;}
      if(document.fullscreenElement){event.preventDefault();document.exitFullscreen().catch(report);return;}
      if(state.focus&&!document.fullscreenElement)setFocus(false);return;
    }
    if(dialogs.some(id=>$(id).open))return;
    if(modifier&&key==='p'&&state.ready){event.preventDefault();search(event.shiftKey&&!state.scope.sessionKey?'symbols':'files');}
    if(modifier&&key==='f'&&state.current){event.preventDefault();showFind();}
    if(modifier&&key==='g'&&state.current){event.preventDefault();$('line-input').focus();$('line-input').select();}
    if(modifier&&!event.shiftKey&&!event.altKey&&key==='b'){event.preventDefault();toggleExplorer();}
    if(event.altKey&&!modifier&&event.code==='KeyZ'&&state.current){event.preventDefault();$('wrap-code').click();}
    if(event.altKey&&!modifier&&!typing&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();navigateHistory(event.key==='ArrowLeft'?-1:1).catch(report);}
    if(event.key==='?'&&!modifier&&!event.altKey&&!typing){event.preventDefault();openShortcuts();}
  });

  // ---- Start ------------------------------------------------------------------------------------------------------
  setExplorerWidth(Number(load(storageKeys.width,280))||280,false);syncExplorer();
  (async()=>{
    try{
      const roots=await api('roots');for(const root of roots){const option=new Option(`${root.name} \u2014 ${root.path}`,root.id);$('root-select').add(option);}
      state.rootIds=new Set(roots.map(root=>root.id));renderEmpty();
      const params=new URLSearchParams(location.search),sessionKey=params.get('sessionKey'),file=params.get('file');const line=Number(params.get('line')||1);
      if(!Number.isInteger(line)||line<1)throw new Error('Invalid line number.');
      if(sessionKey){
        if(!/^artifacts\/[^/].*/i.test(file||''))throw new Error('A session artifact file path is required.');
        const root=await api('session-root',{sessionKey});await openScope({sessionKey},root.name,{path:file.replace(/^artifacts\//i,''),line});
      }else if(params.has('root')){
        const root=roots.find(item=>item.id===params.get('root'));if(!root)throw new Error('The selected source location is unavailable. Open another project.');
        const projectPath=params.get('project')||'';
        await openScope({rootId:root.id,projectPath},root.name+(projectPath?' / '+projectPath:''),file?{path:file,line}:null);
      }else picker();
      // Retain an explicitly linked range after openFile's ordinary single-line navigation.
      if(params.has('endLine')){
        const end=Number(params.get('endLine'));
        if(!file||!Number.isSafeInteger(end)||end<line||!state.current||end>state.current.lineCount)throw new Error('The requested source line range is unavailable.');
        for(let selected=line;selected<=end;selected++)$('code').querySelector(`[data-line="${selected}"]`)?.classList.add('target');
        const url=new URL(location.href);url.searchParams.set('endLine',String(end));history.replaceState(null,'',url);
      }
    }catch(error){report(error);}
  })();
})();
