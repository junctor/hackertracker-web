(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{1491:function(e,n,t){Promise.resolve().then(t.bind(t,8212))},8212:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return l}});var i=t(7437),s=t(1994),r=t(9039),a=t(6463),c=t(3764),o=t(5843);function l(){let{data:e,error:n,isLoading:t}=(0,r.ZP)("ht/index.json",s._i);if(t)return(0,i.jsx)(c.Z,{});if(void 0===e||void 0!==n)return(0,i.jsx)(o.Z,{msg:null==n?void 0:n.message});let l=(0,s.nQ)(e)[0].code;return(0,a.redirect)("/schedule?conf=".concat(l))}t(2265)},5843:function(e,n,t){"use strict";t.d(n,{Z:function(){return r}});var i=t(7437),s=t(7138);function r(e){let{msg:n}=e;return(0,i.jsx)("main",{children:(0,i.jsx)("div",{className:"flex content-center h-screen justify-center items-center text-center",children:(0,i.jsx)(s.default,{href:"/",children:(0,i.jsxs)("div",{children:[(0,i.jsx)("h1",{className:" text-2xl md:text-4xl",children:"Error"}),(0,i.jsx)("h4",{className:"text-xs md:text-sm",children:null!=n?n:""}),(0,i.jsx)("h3",{className:"text-base md:text-md",children:"Return Home"})]})})})})}t(2265)},3764:function(e,n,t){"use strict";var i=t(7437);t(2265),n.Z=function(){return(0,i.jsx)("main",{children:(0,i.jsx)("div",{className:"flex content-center h-screen",children:(0,i.jsx)("h1",{className:"animate-spin m-auto text-3xl block font-bold",children:"HT"})})})}},1994:function(e,n,t){"use strict";t.d(n,{_i:function(){return i},mx:function(){return s},nQ:function(){return r}});let i=async function(){for(var e=arguments.length,n=Array(e),t=0;t<e;t++)n[t]=arguments[t];return await fetch(...n).then(async e=>await e.json())},s=(e,n)=>{var t;let i=new Intl.ListFormat("en",{style:"long",type:"conjunction"}),s=null!==(t=null==n?void 0:n.flatMap(e=>e.tags))&&void 0!==t?t:[];return e.map(e=>{var n,t,r,a,c;return{id:e.id,begin:e.begin,beginTimestampSeconds:e.begin_timestamp.seconds,end:e.end,endTimestampSeconds:e.end_timestamp.seconds,title:e.title,location:e.location.name,color:null!==(r=null==e?void 0:null===(n=e.type)||void 0===n?void 0:n.color)&&void 0!==r?r:"",category:null!==(a=null==e?void 0:null===(t=e.type)||void 0===t?void 0:t.name)&&void 0!==a?a:"",tags:null!==(c=e.tag_ids.map(e=>s.find(n=>n.id===e)).filter(e=>void 0!==e))&&void 0!==c?c:[],speakers:i.format(e.speakers.map(e=>e.name))}})};function r(e){let n=new Date().getTime()/1e3;return e.sort((e,t)=>Math.abs(n-e.start_timestamp.seconds)-Math.abs(n-t.start_timestamp.seconds))}}},function(e){e.O(0,[532,971,23,744],function(){return e(e.s=1491)}),_N_E=e.O()}]);