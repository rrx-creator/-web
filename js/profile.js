(function(){
"use strict";
var key="hlp.profile";
var fields=["fullName","homeAddress","myPhone","birthYear","emergencyName","emergencyPhone","conditions","conditionsEn","allergies","allergiesEn","medications","medicationsEn","insuranceName","insuranceId","doctorName","doctorPhone","nearestHospital","workplace"];
var translationMap={
 "无":"None","没有":"None","高血压":"Hypertension","糖尿病":"Diabetes","高血脂":"High cholesterol","心脏病":"Heart disease","冠心病":"Coronary artery disease","哮喘":"Asthma","关节炎":"Arthritis","骨质疏松":"Osteoporosis","肾病":"Kidney disease",
 "青霉素":"Penicillin","阿司匹林":"Aspirin","磺胺":"Sulfa drugs","花生":"Peanuts","海鲜":"Seafood",
 "二甲双胍":"Metformin","降压药":"Blood pressure medicine","胰岛素":"Insulin"
};
function suggestEnglish(value){
 var text=String(value||"").trim();if(!text)return"";
 var parts=text.split(/[，,；;、。]+/).map(function(x){return x.trim()}).filter(Boolean);
 return parts.map(function(part){
  if(translationMap[part])return translationMap[part];
  var out=part;Object.keys(translationMap).sort(function(a,b){return b.length-a.length}).forEach(function(cn){out=out.split(cn).join(translationMap[cn])});
  return out;
 }).join(", ");
}
function load(){try{var v=JSON.parse(localStorage.getItem(key)||"{}");return v&&typeof v==="object"?v:{}}catch(e){return {}}}
function save(v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch(e){showTip("浏览器没有允许保存；请检查隐私设置");return false}}
function focusLink(name,label){var a=document.createElement("a");a.href="profile.html?focus="+encodeURIComponent(name);a.className="fill-link";a.textContent=label||"（还没填 · 点这里填）";return a}
function render(){
 var p=load();var has=fields.some(function(k){return String(p[k]||"").trim()});
 document.querySelectorAll(".info-alert").forEach(function(x){x.hidden=has});
 document.querySelectorAll("[data-profile-cta]").forEach(function(x){x.textContent=has?"✅ 我的信息（已填好，点这里修改）":"📝 先填一下我的信息（1 分钟）"});
 document.querySelectorAll("[data-field]").forEach(function(el){var name=el.getAttribute("data-field");var val=String(p[name]||"").trim();el.replaceChildren(val?document.createTextNode(val):focusLink(name,el.getAttribute("data-empty")))});
 document.querySelectorAll("[data-template]").forEach(function(card){
  var tmpl=card.getAttribute("data-template");var missing=[];
  var text=tmpl.replace(/\[([A-Za-z]+)\]/g,function(_,name){var val=String(p[name]||"").trim();if(!val)missing.push(name);return val});
  var en=card.querySelector(".phrase-en,[data-template-text]");var btn=card.querySelector("[data-speak]");
  if(missing.length){card.classList.add("disabled");if(en)en.replaceChildren(focusLink(missing[0],"填好您的信息，这句话才能用 →"));if(btn)btn.setAttribute("data-speak","")}
  else{card.classList.remove("disabled");if(en)en.textContent=text;if(btn)btn.setAttribute("data-speak",text)}
 });
}
window.HLPProfile={load:load,save:save,render:render,fields:fields};
render();
var form=document.querySelector("#profile-form");
if(form){
 var p=load();fields.forEach(function(name){if(form.elements[name])form.elements[name].value=p[name]||""});
 [["conditions","conditionsEn"],["allergies","allergiesEn"],["medications","medicationsEn"]].forEach(function(pair){
  var source=form.elements[pair[0]],english=form.elements[pair[1]],last="";
  if(!source||!english)return;
  if(!english.value){last=suggestEnglish(source.value);english.value=last}
  source.addEventListener("input",function(){if(!english.value||english.value===last){last=suggestEnglish(source.value);english.value=last}});
 });
 form.addEventListener("submit",function(e){e.preventDefault();var out={};fields.forEach(function(name){var input=form.elements[name];out[name]=input?input.value.trim():""});form.querySelectorAll(".field-error").forEach(function(x){x.remove()});["fullName","homeAddress","myPhone","birthYear","emergencyName","emergencyPhone"].forEach(function(name){if(!out[name]){var msg=document.createElement("div");msg.className="field-error";msg.textContent="这一项最好填上，紧急的时候用得到";form.elements[name].insertAdjacentElement("afterend",msg)}});if(save(out)){render();var status=document.querySelector(".save-status");status.classList.add("show");setTimeout(function(){if(history.length>1)history.back();else location.href="index.html"},2000)}});
 var clear=document.querySelector("[data-clear-profile]");if(clear)clear.addEventListener("click",function(){if(confirm("清空以后，求助的句子里就不会有您的地址和电话了。确定要清空吗？")){try{localStorage.removeItem(key)}catch(e){}form.reset();render();showTip("已经清空")}})
 var q=new URLSearchParams(location.search).get("focus");if(q&&form.elements[q])setTimeout(function(){var row=form.elements[q].closest(".form-row");row.classList.add("focus-flash");row.scrollIntoView({behavior:"smooth",block:"center"});form.elements[q].focus();setTimeout(function(){row.classList.remove("focus-flash")},2000)},200)
}
})();
