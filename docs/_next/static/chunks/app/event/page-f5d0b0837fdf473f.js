(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[590],{1811:function(e,n,t){Promise.resolve().then(t.bind(t,2727))},2727:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return k}});var r=t(7437),s=t(3764),a=t(1994),c=t(9039),l=t(5843),i=t(6463),o=t(4867);let d="https://hackertracker.app",m=e=>{let n=e.speakers.map(e=>e.name).join(", ");return"".concat(e.description," - ").concat(n)},u=e=>{let n="0".concat(e.getUTCDate()).slice(-2),t="0".concat(e.getUTCMonth()+1).slice(-2),r="0".concat(e.getUTCHours()).slice(-2),s="0".concat(e.getUTCMinutes()).slice(-2),a="0".concat(e.getUTCSeconds()).slice(-2);return"".concat(e.getUTCFullYear()).concat(t).concat(n,"T").concat(r).concat(s).concat(a,"Z")};var x=e=>"BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//hackertracker//".concat(e.conference," Calendar 1.0//EN\nBEGIN:VEVENT\nDTSTAMP:").concat(u(new Date),"\nUID:").concat(e.id,"\nDTSTART:").concat(u(new Date(e.begin)),"\nDTEND:").concat(u(new Date(e.end)),"\nSTATUS:CONFIRMED\nCATEGORIES:CONFERENCE\nSUMMARY:").concat(e.conference,"\nURL:").concat(d,"/conferences/").concat(e.conference,"/event/?id=").concat(e.id,"\nLOCATION:").concat(e.location.name,"\nDESCRIPTION:").concat(m(e).replace(/(\r\n|\n|\r)/gm," "),"\nEND:VEVENT\nEND:VCALENDAR").replaceAll("\n","\r\n").trim(),f=t(880),h=t(8358),g=t(7138),p=t(2265),v=t(7074);function j(e,n){var t;return null===(t=e.find(e=>e.person_id===n))||void 0===t?void 0:t.sort_order}var N=function(e){var n,t,s,a,c,l,i,m;let{conf:u,event:p,tags:N}=e,b=null!==(c=null==N?void 0:N.flatMap(e=>e.tags))&&void 0!==c?c:[],w=null!==(l=null==p?void 0:null===(t=p.tag_ids)||void 0===t?void 0:null===(n=t.map(e=>b.find(n=>n.id===e)))||void 0===n?void 0:n.filter(e=>void 0!==e))&&void 0!==l?l:[];return(0,r.jsxs)("div",{className:"mx-5",children:[(0,r.jsxs)("div",{className:"flex",children:[(0,r.jsxs)("div",{className:"my-2 justify-start flex-auto",children:[(0,r.jsx)(h.aG,{children:(0,r.jsxs)(h.Jb,{children:[(0,r.jsx)(h.gN,{children:(0,r.jsx)(h.At,{asChild:!0,children:(0,r.jsxs)(g.default,{href:"../schedule?conf=".concat(u.code),children:[u.name," Schedule"]})})}),(0,r.jsx)(h.bg,{})]})}),(0,r.jsx)("div",{className:"my-3",children:(0,r.jsx)("h1",{className:"font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-5 mr-3 text-[".concat(null==p?void 0:null===(s=p.type)||void 0===s?void 0:s.color,"]"),children:p.title})})]}),(0,r.jsx)("div",{className:"mr-10 ml-5 content-center justify-end flex-none hidden md:block",children:(0,r.jsxs)("div",{className:"flex",children:[(0,r.jsx)("a",{href:"data:text/calendar;charset=utf8,".concat(encodeURIComponent(x(p))),download:"".concat(p.conference,"-").concat(p.id,".ics"),children:(0,r.jsx)(o.Que,{className:"h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2"})}),"function"==typeof navigator.share&&(0,r.jsx)(o.eA8,{className:"h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2",onClick:async()=>{try{await navigator.share({title:p.title,url:"".concat(d,"/event/?id=").concat(p.id)})}catch(e){console.error(e);return}}})]})})]}),(0,r.jsxs)("div",{className:"font-bold",children:[(0,r.jsx)("div",{className:"flex items-center w-11/12 my-2 cursor-pointer",children:(0,r.jsxs)("a",{className:"flex",href:"data:text/calendar;charset=utf8,".concat(encodeURIComponent(x(p))),download:"".concat(p.conference,"-").concat(p.id,".ics"),children:[(0,r.jsx)(o.T39,{className:"h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2"}),(0,r.jsx)("p",{className:"md:text-base lg:text-lg text-xs",children:p.end_timestamp.seconds!==p.begin_timestamp.seconds?"".concat((0,f.fb)(new Date(p.begin),!1)," - ").concat((0,f.fb)(new Date(p.end),!0)):"".concat((0,f.fb)(new Date(p.begin),!0))})]})}),(0,r.jsxs)("div",{className:"flex items-center w-11/12 my-2",children:[(0,r.jsx)(o.N_q,{className:"h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2"}),(0,r.jsx)("p",{className:"md:text-base lg:text-lg text-xs",children:p.location.name})]}),(0,r.jsx)("div",{className:"grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-2 lg:gap-3",children:null==w?void 0:null===(a=w.sort((e,n)=>e.sort_order>n.sort_order?1:-1))||void 0===a?void 0:a.map(e=>(0,r.jsxs)("div",{className:"flex items-center mr-4 md:mr-5 lg:mr-6",children:[(0,r.jsx)("span",{className:"rounded-full h-4 w-4 md:h-5 md:w-5 lg:w-6 lg:h-6 mr-2 green inline-flex flex-none bg-[".concat(e.color_background,"]")}),(0,r.jsx)("p",{className:"text-xs md:text-sm lg:text-base",children:e.label})]},e.id))})]}),(0,r.jsx)("div",{className:"mt-10",children:(0,r.jsxs)("div",{className:"text-sm md:text-base lg:text-lg w-11/12",children:[(0,r.jsx)(v.Z,{content:p.description}),(null!==(i=p.links)&&void 0!==i?i:[]).length>0&&(0,r.jsxs)("div",{className:"mt-5 text-left",children:[(0,r.jsx)("h2",{className:"font-bold text-base sm:text-lg md:text-xl lg:text-2xl",children:"Links"}),(0,r.jsx)("ul",{className:"list-disc text-xs sm:text-sm md:text-base lg:text-lg ml-5 mt-2",children:(null!==(m=p.links)&&void 0!==m?m:[]).map(e=>(0,r.jsx)("li",{children:(0,r.jsx)("a",{href:e.url,children:e.label})},e.url))})]})]})}),p.speakers.length>0&&(0,r.jsxs)("div",{className:"mt-10 text-left",children:[(0,r.jsx)("h2",{className:"font-bold text-base sm:text-lg md:text-xl lg:text-2xl",children:"People"}),(0,r.jsx)("div",{className:"items-center w-11/12 mt-1 mb-2 pt-2 pb-2",children:p.speakers.sort(e=>{var n,t;return(null!==(n=j(p.people,e.id))&&void 0!==n?n:0)-(null!==(t=j(p.people,e.id))&&void 0!==t?t:0)}).map(e=>(0,r.jsxs)("div",{className:"ml-3 table mt-2 mb-2 align-middle items-center",children:[(0,r.jsx)("div",{className:"ml-1 table-cell h-full w-1 sm:w-2 mr-3 rounded-md"}),(0,r.jsx)(g.default,{href:"/person?conf=".concat(u.code,"&person=").concat(e.id),children:(0,r.jsxs)("div",{className:"inline-block text-left ml-2",children:[(0,r.jsx)("p",{className:"font-bold text-sm sm:text-md md:text-base lg:text-lg",children:e.name}),null!=e.title&&(0,r.jsx)("p",{className:"text-xs sm:text-xs md:text-xs lg:text-sm",children:e.title})]})})]},e.id))})]})]})},b=t(418);function w(){let e=(0,i.useSearchParams)(),n=e.get("conf"),t=e.get("event");if(null===n||null===t)return(0,r.jsx)(l.Z,{msg:"No conference or event code provided"});let{data:o,error:d,isLoading:m}=(0,c.ZP)("../../../ht/index.json",a._i),{data:u,error:x,isLoading:f}=(0,c.ZP)("../../../ht/conferences/".concat(n.toUpperCase(),"/events.json"),a._i),{data:h,isLoading:g}=(0,c.ZP)("../../../ht/conferences/".concat(n.toUpperCase(),"/tags.json"),a._i);if(f||m||g||f||m)return(0,r.jsx)(s.Z,{});if(void 0!==x||void 0!==d||void 0===u||void 0===o)return(0,r.jsx)(l.Z,{});let p=o.find(e=>e.code===n);if(void 0===p)return(0,r.jsx)(l.Z,{msg:"Conference not found"});let v=null==u?void 0:u.find(e=>e.id.toString().toLowerCase()===t.toLowerCase());return void 0===v?(0,r.jsx)(l.Z,{msg:"No event found for id"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("title",{children:"".concat(v.title," | ").concat(p.name)}),(0,r.jsx)("meta",{name:"description",content:"".concat(v.title," | ").concat(p.name," ")}),(0,r.jsx)("link",{rel:"icon",href:"/favicon.ico"}),(0,r.jsxs)("main",{children:[(0,r.jsx)(b.Z,{conf:p,conferences:o}),(0,r.jsx)(N,{conf:p,event:v,tags:null!=h?h:[]})]})]})}function k(){return(0,r.jsx)(p.Suspense,{fallback:(0,r.jsx)("div",{children:"Loading..."}),children:(0,r.jsx)(w,{})})}},7074:function(e,n,t){"use strict";t.d(n,{Z:function(){return i}});var r=t(7437),s=t(9997),a=t(6446);t(2265);var c=t(5317),l=t.n(c);function i(e){let{content:n}=e;return(0,r.jsx)("div",{className:"prose lg:prose-xl whitespace-pre-wrap",children:(0,r.jsx)(a.U,{className:l().markdown,remarkPlugins:[s.Z],children:n})})}},8358:function(e,n,t){"use strict";t.d(n,{At:function(){return m},Jb:function(){return o},aG:function(){return i},bg:function(){return u},gN:function(){return d}});var r=t(7437),s=t(2265),a=t(1538),c=t(7592),l=(t(3550),t(9354));let i=s.forwardRef((e,n)=>{let{...t}=e;return(0,r.jsx)("nav",{ref:n,"aria-label":"breadcrumb",...t})});i.displayName="Breadcrumb";let o=s.forwardRef((e,n)=>{let{className:t,...s}=e;return(0,r.jsx)("ol",{ref:n,className:(0,l.cn)("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",t),...s})});o.displayName="BreadcrumbList";let d=s.forwardRef((e,n)=>{let{className:t,...s}=e;return(0,r.jsx)("li",{ref:n,className:(0,l.cn)("inline-flex items-center gap-1.5",t),...s})});d.displayName="BreadcrumbItem";let m=s.forwardRef((e,n)=>{let{asChild:t,className:s,...c}=e,i=null!=t&&t?a.g7:"a";return(0,r.jsx)(i,{ref:n,className:(0,l.cn)("transition-colors hover:text-foreground",s),...c})});m.displayName="BreadcrumbLink",s.forwardRef((e,n)=>{let{className:t,...s}=e;return(0,r.jsx)("span",{ref:n,role:"link","aria-disabled":"true","aria-current":"page",className:(0,l.cn)("font-normal text-foreground",t),...s})}).displayName="BreadcrumbPage";let u=e=>{let{children:n,className:t,...s}=e;return(0,r.jsx)("li",{role:"presentation","aria-hidden":"true",className:(0,l.cn)("[&>svg]:size-3.5",t),...s,children:null!=n?n:(0,r.jsx)(c.Z,{})})};u.displayName="BreadcrumbSeparator"},880:function(e,n,t){"use strict";function r(e){return new Date(e).toLocaleTimeString("en-US",{hour:"numeric",minute:"numeric",timeZoneName:"short",hour12:!1}).replace(",","").split(" ")}function s(e){return e.toLocaleTimeString("en-US",{timeZoneName:"short",day:"numeric",year:"numeric",month:"numeric",hour12:!1}).split(",").slice(0,1).join()}function a(e){let n=new Date(e);return n.setHours(8,0,0),n.toLocaleDateString("en-US",{day:"numeric",month:"short"})}function c(e){let n=!(arguments.length>1)||void 0===arguments[1]||arguments[1];return e.toLocaleTimeString("en-US",{timeZoneName:n?"short":void 0,weekday:"short",hour12:!1,day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}t.d(n,{EG:function(){return r},HA:function(){return i},Os:function(){return a},fG:function(){return s},fb:function(){return c}});let l=e=>e.sort((e,n)=>e.beginTimestampSeconds-n.beginTimestampSeconds).reduce((e,n)=>{var t;let r=s(new Date(n.begin)),a=null!==(t=e.get(r))&&void 0!==t?t:[];return a.push(n),e.set(r,a),e},new Map),i=e=>new Map(Array.from(l(e)).map(e=>{let[n,t]=e;return[n,t.sort((e,n)=>e.beginTimestampSeconds-n.beginTimestampSeconds)]}))},5317:function(e){e.exports={markdown:"markdown_markdown__wTkaE"}}},function(e){e.O(0,[612,310,532,231,575,864,971,23,744],function(){return e(e.s=1811)}),_N_E=e.O()}]);