var ExtensionPublishingServiceService = (function(){
  const baseUrl = "/api/buffaly.extensionpublishing.webmodule/extension-publishing-service";
  async function post(method, payload){
    const response = await fetch(baseUrl + "/" + method, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    const text = await response.text();
    if(!response.ok) throw new Error(text || ("HTTP " + response.status));
    return text ? JSON.parse(text) : null;
  }
  function Service(){}
  Service.prototype.GetPublishingCatalogObjectAsync = function(o){ return post("get-publishing-catalog", o); };
  Service.prototype.GetPublishingCatalogAsync = function(request){ return this.GetPublishingCatalogObjectAsync({request:request}); };
  Service.prototype.GetExtensionPublishStatusObjectAsync = function(o){ return post("get-extension-publish-status", o); };
  Service.prototype.BuildExtensionObjectAsync = function(o){ return post("build-extension", o); };
  Service.prototype.PreviewPublishExtensionObjectAsync = function(o){ return post("preview-publish-extension", o); };
  Service.prototype.PublishExtensionObjectAsync = function(o){ return post("publish-extension", o); };
  return Service;
})();
var ExtensionPublishingService = new ExtensionPublishingServiceService();
globalThis.ExtensionPublishingServiceService = ExtensionPublishingServiceService;
globalThis.ExtensionPublishingService = ExtensionPublishingService;

(function installExtensionPublishingBuffalyStyle(){
  function addLink(href){
    if(document.querySelector('link[href="' + href + '"]')) return;
    var link=document.createElement('link'); link.rel='stylesheet'; link.href=href; document.head.appendChild(link);
  }
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function(){
    addLink('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
    addLink('custom_css/buffaly-navigation.css?v=20260530.4');
    addLink('custom_css/buffaly-page.css?v=20260526.1');
    document.body.classList.add('buffaly-page');
    if(!document.querySelector('.buffaly-app-strip')){
      var strip=document.createElement('div');
      strip.className='buffaly-app-strip';
      strip.setAttribute('role','banner');
      strip.innerHTML='<a class="buffaly-app-strip-brand" href="buffaly-agent.html"><img src="images/bf_logo_fav_Large.png" alt=""><span>Buffaly</span></a><div class="buffaly-app-strip-center"><buffaly-navigation-launcher label="Navigation" variant="strip" current-href="extension-publishing"></buffaly-navigation-launcher></div><div class="buffaly-app-strip-page">Extension Publishing</div>';
      document.body.insertBefore(strip, document.body.firstChild);
    }
    var wrap=document.querySelector('.wrap'); if(wrap) wrap.classList.add('buffaly-page-shell','extension-publishing-shell');
    var hero=document.querySelector('.hero');
    if(hero){
      hero.classList.add('buffaly-page-hero');
      if(!hero.querySelector('.buffaly-kicker')) hero.insertAdjacentHTML('afterbegin','<p class="buffaly-kicker">Maintainer tools</p>');
      var h1=hero.querySelector('h1'); if(h1){h1.classList.add('buffaly-title'); if(!h1.textContent.includes('📦')) h1.innerHTML='<span class="extension-publishing-hero-icon">📦</span> Extension Publishing';}
      var p=hero.querySelector('p:not(.buffaly-kicker)'); if(p) p.classList.add('buffaly-subtitle');
    }
    document.querySelectorAll('.card').forEach(function(card){card.classList.add('buffaly-panel');});
    document.querySelectorAll('.card h2').forEach(function(h){h.classList.add('buffaly-panel-title');});
    document.querySelectorAll('.btn').forEach(function(btn){btn.classList.add('buffaly-button'); if(btn.classList.contains('primary')) btn.classList.remove('secondary'); else btn.classList.add('secondary');});
    document.querySelectorAll('input[type=text]').forEach(function(input){input.classList.add('buffaly-input');});
  });
})();
