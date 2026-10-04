(function(){
"use strict";
var box=document.querySelector("[data-tax-official-links]");
if(!box)return;
var states=window.STATE_TAX_SITES||{};
var federalUrl="https://www.irs.gov/individual-tax-filing";
var stateHelpUrl="https://www.usa.gov/state-taxes";
function profile(){try{return window.HLPProfile&&window.HLPProfile.load?window.HLPProfile.load():JSON.parse(localStorage.getItem("hlp.profile")||"{}")}catch(e){return{}}}
function esc(value){return String(value||"").replace(/[&<>"']/g,function(ch){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]})}
function detectState(address){
 var value=String(address||"").trim();if(!value)return null;
 var upper=value.toUpperCase();
 var codes=Object.keys(states);
 for(var i=0;i<codes.length;i++){var code=codes[i];var re=new RegExp("(?:^|[\\s,])"+code+"(?=\\s+\\d{5}(?:-\\d{4})?(?:\\s|$)|[\\s,]|$)","i");if(re.test(value))return code}
 var lowered=value.toLowerCase();
 var names=codes.slice().sort(function(a,b){return states[b][0].length-states[a][0].length});
 for(var j=0;j<names.length;j++){var name=states[names[j]][0].toLowerCase();if(lowered.indexOf(name)!==-1)return names[j]}
 return null;
}
function card(url,title,description){return '<a class="tax-official-card" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><strong>'+esc(title)+' ↗</strong><span>'+esc(description)+'</span></a>'}
var saved=profile();
var address=saved.homeAddress||saved.address||"";
var code=detectState(address);
var html='<h3>🌐 联邦和州的报税官方网站</h3>';
if(code){
 var state=states[code];
 html+='<p class="tax-detected">根据“我的信息”中的地址，识别为：'+esc(state[0])+'（'+esc(code)+'）</p>';
 html+='<div class="tax-link-grid">'+card(federalUrl,"美国国税局 IRS","联邦个人所得税申报与帮助")+card(state[1],state[0]+" 州税务官网","州税申报、付款与州级帮助")+'</div>';
 html+='<p class="search-privacy">地址只在您的设备上用于识别州，不会因为此功能上传。州不对？请到<a href="profile.html#homeAddress">“我的信息”</a>修改地址。</p>';
 }else{
 html+='<p>还没有从“我的信息”里识别出州。请在家庭地址中写明州名或两位州缩写（例如 NY 11354）。</p>';
 html+='<div class="tax-link-grid">'+card(federalUrl,"美国国税局 IRS","联邦个人所得税申报与帮助")+card(stateHelpUrl,"查找州税务机关","由美国政府网站提供的各州税务入口")+'</div>';
 html+='<p><a class="btn secondary" href="profile.html#homeAddress">补充或修改我的地址</a></p>';
 }
box.innerHTML=html;
window.HLPTaxLinks={detectState:detectState};
})();
