(function(){
"use strict";
var index=Array.isArray(window.SITE_SEARCH_INDEX)?window.SITE_SEARCH_INDEX:[];
var quick=["叫救护车","牙疼","看医生","迷路","账单","报税"];
var synonymMap={
 "救护车":"911 急救 急诊 喘不上气 胸口痛",
 "胸痛":"胸口疼 急救 911",
 "头晕":"不舒服 急诊 看医生",
 "牙疼":"看牙 牙医 牙科",
 "被骗":"骗子 诈骗 银行 政府信件",
 "迷路":"走丢 问路 出行",
 "水费":"水电煤气 账单",
 "电费":"水电煤气 账单",
 "退东西":"退货 超市 收据",
 "拿药":"药房 取药 续药",
 "找翻译":"中文翻译 不会英语 Chinese interpreter",
 "身份证":"证件 驾照 DMV",
 "老人报税":"免费报税 TCE VITA",
 "手机卡":"手机 上网 SIM"
};
function norm(s){return String(s||"").toLowerCase().replace(/[\s，。！？、,.!?'"“”‘’()（）/\\:：;-]+/g,"")}
function termsFor(query){
 var raw=String(query||"").trim(),parts=raw.split(/\s+/).filter(Boolean),more=[];
 Object.keys(synonymMap).forEach(function(k){if(raw.indexOf(k)!==-1)more=more.concat(synonymMap[k].split(/\s+/))});
 return [raw].concat(parts,more).map(norm).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i})
}
function score(entry,terms){
 var title=norm(entry.title),desc=norm(entry.description),keys=norm(entry.keywords),body=norm(entry.content),score=0,hits=0;
 terms.forEach(function(t){var hit=false;if(title.indexOf(t)!==-1){score+=18;hit=true}if(keys.indexOf(t)!==-1){score+=12;hit=true}if(desc.indexOf(t)!==-1){score+=8;hit=true}if(body.indexOf(t)!==-1){score+=3;hit=true}if(hit)hits++});
 if(hits===terms.length)score+=12;
 return score
}
function esc(s){return String(s||"").replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function snippet(entry,terms){
 var text=entry.content||entry.description||"",at=-1;
 for(var i=0;i<terms.length;i++){var t=terms[i];if(!t)continue;at=norm(text).indexOf(t);if(at>=0)break}
 if(at<0)return entry.description;
 var plain=text.replace(/\s+/g," ").trim(),rawTerm=terms.find(function(t){return norm(plain).indexOf(t)>=0}),realAt=rawTerm?norm(plain).indexOf(rawTerm):0;
 var start=Math.max(0,realAt-32),out=plain.slice(start,start+118);
 return(start?"…":"")+out+(start+118<plain.length?"…":"")
}
var shell=document.createElement("div");
shell.className="site-search-shell";
shell.innerHTML='<form class="site-search-form" role="search"><label class="site-search-label" for="site-search-input">🔎 全站搜索</label><input class="site-search-input" id="site-search-input" type="search" autocomplete="off" enterkeyhint="search" placeholder="搜一搜：牙疼、迷路、账单……" aria-controls="site-search-panel"><button class="site-search-submit" type="submit">搜索</button></form><section class="site-search-panel" id="site-search-panel" hidden aria-live="polite"><div class="site-search-panel-head"><h2>全站搜索</h2><button class="site-search-close" type="button" aria-label="关闭搜索结果">×</button></div><p class="site-search-help">输入您遇到的事情，我们会把相关页面和内容列出来，由您选择。</p><div class="site-search-content"></div></section>';
document.body.appendChild(shell);
var form=shell.querySelector("form"),input=shell.querySelector("input"),panel=shell.querySelector(".site-search-panel"),content=shell.querySelector(".site-search-content"),close=shell.querySelector(".site-search-close");
function showQuick(){
 content.innerHTML='<div class="search-quick">'+quick.map(function(q){return'<button type="button" data-search-quick="'+esc(q)+'">'+esc(q)+'</button>'}).join("")+'</div>'
}
function render(query){
 var q=String(query||"").trim();panel.hidden=false;
 if(!q){showQuick();return}
 var terms=termsFor(q);
 var found=index.map(function(entry){return{entry:entry,score:score(entry,terms)}}).filter(function(x){return x.score>0}).sort(function(a,b){return b.score-a.score}).slice(0,8);
 if(found.length){
  content.innerHTML='<div class="search-results">'+found.map(function(x){var item=x.entry;return'<a class="search-result" href="'+esc(item.url)+'"><strong>'+esc(item.title)+' →</strong><span class="search-result-category">'+esc(item.category)+'</span><p>'+esc(item.description)+'</p><p class="search-result-snippet">相关内容：'+esc(snippet(item,terms))+'</p></a>'}).join("")+'</div>';
 }else{
  content.innerHTML='<div class="search-empty"><h3>暂时没有找到相关内容</h3><p>您可以把这个需求提交给我们，帮助网站以后补充。</p><label class="search-feedback-label" for="search-feedback-text">希望增加什么内容？</label><textarea class="search-feedback-text" id="search-feedback-text" maxlength="200"></textarea><p class="search-privacy">只提交这段搜索内容和当前页面。请不要填写姓名、住址、电话号码或其他个人信息。</p><button class="btn full search-feedback-submit" type="button">提交这个需求</button><p class="search-feedback-status" role="status"></p></div>';
  content.querySelector("textarea").value=q;
 }
}
function queueFeedback(item){try{var list=JSON.parse(localStorage.getItem("hlp.pendingSearchFeedback")||"[]");if(!Array.isArray(list))list=[];list.push(item);localStorage.setItem("hlp.pendingSearchFeedback",JSON.stringify(list.slice(-10)))}catch(e){}}
async function sendFeedback(item){
 var response=await fetch("/api/missing-searches",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(item)});
 if(!response.ok)throw new Error("submit failed");
 return response.json()
}
async function flushPending(){
 var list=[];try{list=JSON.parse(localStorage.getItem("hlp.pendingSearchFeedback")||"[]")}catch(e){}
 if(!Array.isArray(list)||!list.length)return;
 var remaining=[];
 for(var i=0;i<list.length;i++){try{await sendFeedback(list[i])}catch(e){remaining=remaining.concat(list.slice(i));break}}
 try{localStorage.setItem("hlp.pendingSearchFeedback",JSON.stringify(remaining))}catch(e){}
}
form.addEventListener("submit",function(e){e.preventDefault();render(input.value)});
input.addEventListener("focus",function(){if(panel.hidden)render(input.value)});
input.addEventListener("input",function(){render(input.value)});
close.addEventListener("click",function(){panel.hidden=true;input.focus()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!panel.hidden){panel.hidden=true;input.focus()}});
content.addEventListener("click",async function(e){
 var chip=e.target.closest("[data-search-quick]");if(chip){input.value=chip.getAttribute("data-search-quick");render(input.value);input.focus();return}
 var submit=e.target.closest(".search-feedback-submit");if(!submit)return;
 var box=content.querySelector(".search-feedback-text"),status=content.querySelector(".search-feedback-status"),query=box.value.trim();
 if(!query){status.className="search-feedback-status error";status.textContent="请先写下您想找的内容。";box.focus();return}
 submit.disabled=true;status.className="search-feedback-status";status.textContent="正在提交……";
 var item={query:query,page_path:location.pathname};
 try{await sendFeedback(item);status.className="search-feedback-status success";status.textContent="✅ 已经收到，谢谢您帮助我们改进网站。";submit.remove()}
 catch(err){queueFeedback(item);status.className="search-feedback-status error";status.textContent="暂时没有提交成功，已保存在这台手机里；下次联网打开网站时会再试。";submit.disabled=false}
});
showQuick();
flushPending();
})();
