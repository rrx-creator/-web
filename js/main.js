(function(){
"use strict";
var voices=[];
function getVoices(){try{voices=window.speechSynthesis?window.speechSynthesis.getVoices():[]}catch(e){voices=[]}}
getVoices();
if("speechSynthesis" in window){window.speechSynthesis.addEventListener("voiceschanged",getVoices)}
window.showTip=function(message){var old=document.querySelector(".toast");if(old)old.remove();var el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent=message;document.body.appendChild(el);setTimeout(function(){el.remove()},3200)}
window.speak=function(text,lang){
 if(!("speechSynthesis" in window)){showTip("您的浏览器不支持朗读");return}
 if(!text){showTip("请先把这项个人信息填好");return}
 try{
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);u.lang=lang||"en-US";u.rate=.8;
  var enVoice=voices.find(function(v){return(v.lang||"").toLowerCase().indexOf("en-us")===0})||voices.find(function(v){return(v.lang||"").toLowerCase().indexOf("en")===0});
  if(enVoice)u.voice=enVoice;
  u.onerror=function(){showTip("没有找到可用的英语语音包，请在手机设置里下载英语语音")};
  window.speechSynthesis.speak(u)
 }catch(e){showTip("暂时无法朗读，请检查手机语音设置")}
};
document.addEventListener("click",function(e){
 var b=e.target.closest("[data-speak]");if(b){e.preventDefault();speak(b.getAttribute("data-speak"),b.getAttribute("data-lang")||"en-US")}
 var m=e.target.closest(".menu-toggle");if(m){var n=document.querySelector(".nav");var open=n.classList.toggle("open");m.setAttribute("aria-expanded",String(open))}
});
var size="";try{size=localStorage.getItem("hlp.fontsize")||""}catch(e){}
function applySize(v){document.body.classList.remove("fs-lg","fs-xl");if(v==="lg")document.body.classList.add("fs-lg");if(v==="xl")document.body.classList.add("fs-xl");document.querySelectorAll("[data-size]").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-size")===v);b.setAttribute("aria-pressed",String(b.getAttribute("data-size")===v))})}
applySize(size);
document.querySelectorAll("[data-size]").forEach(function(b){b.addEventListener("click",function(){var v=b.getAttribute("data-size");applySize(v);try{localStorage.setItem("hlp.fontsize",v)}catch(e){}})});
function updateDaily(offset){if(!window.DAILY_PHRASES)return;var day=Math.floor(Date.now()/86400000);var i=(day+(offset||0))%window.DAILY_PHRASES.length;var p=window.DAILY_PHRASES[i];var box=document.querySelector("[data-daily]");if(!box)return;box.querySelector("[data-daily-en]").textContent=p.en;box.querySelector("[data-daily-cn]").textContent=p.cn;box.querySelector("[data-daily-speak]").setAttribute("data-speak",p.en);box.dataset.offset=String(offset||0)}
updateDaily(0);
var next=document.querySelector("[data-daily-next]");if(next)next.addEventListener("click",function(){var box=document.querySelector("[data-daily]");updateDaily(Number(box.dataset.offset||0)+1)});
document.querySelectorAll("[data-print]").forEach(function(b){b.addEventListener("click",function(){window.print()})});
document.querySelectorAll("[data-persist-checks]").forEach(function(group){var key=group.getAttribute("data-persist-checks");var state=[];try{state=JSON.parse(localStorage.getItem(key)||"[]")}catch(e){}group.querySelectorAll("input[type=checkbox]").forEach(function(c,i){c.checked=!!state[i];c.addEventListener("change",function(){var a=[];group.querySelectorAll("input[type=checkbox]").forEach(function(x){a.push(x.checked)});try{localStorage.setItem(key,JSON.stringify(a))}catch(e){}})})});
var backTop=document.createElement("button");
backTop.type="button";
backTop.className="back-to-top";
backTop.setAttribute("aria-label","回到页面最上方");
backTop.setAttribute("title","回到顶部");
backTop.innerHTML='<span aria-hidden="true">↑</span><small>顶部</small>';
document.body.appendChild(backTop);
function updateBackTop(){backTop.classList.toggle("show",window.scrollY>480)}
window.addEventListener("scroll",updateBackTop,{passive:true});
backTop.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});backTop.blur()});
updateBackTop();
var searchData=document.createElement("script");
searchData.src="data/search-index.js";
searchData.onload=function(){var searchApp=document.createElement("script");searchApp.src="js/search.js";document.head.appendChild(searchApp)};
document.head.appendChild(searchData);
})();
