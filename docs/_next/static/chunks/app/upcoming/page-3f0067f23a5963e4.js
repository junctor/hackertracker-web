(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[814],{8974:function(e,t,n){Promise.resolve().then(n.bind(n,5565))},5565:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return el}});var r=n(7437),a=n(3764),s=n(1994),o=n(5843),l=n(6463),i=n(418),d=n(2265),c=n(8149),u=n(8324),m=n(976),f=n(1584),p=n(3201),x=n(5171),h=n(5137),g=n(1715),b=n(7513),v="rovingFocusGroup.onEntryFocus",j={bubbles:!1,cancelable:!0},w="RovingFocusGroup",[y,N,R]=(0,m.B)(w),[S,T]=(0,u.b)(w,[R]),[k,C]=S(w),_=d.forwardRef((e,t)=>(0,r.jsx)(y.Provider,{scope:e.__scopeRovingFocusGroup,children:(0,r.jsx)(y.Slot,{scope:e.__scopeRovingFocusGroup,children:(0,r.jsx)(D,{...e,ref:t})})}));_.displayName=w;var D=d.forwardRef((e,t)=>{let{__scopeRovingFocusGroup:n,orientation:a,loop:s=!1,dir:o,currentTabStopId:l,defaultCurrentTabStopId:i,onCurrentTabStopIdChange:u,onEntryFocus:m,preventScrollOnEntryFocus:p=!1,...w}=e,y=d.useRef(null),R=(0,f.e)(t,y),S=(0,b.gm)(o),[T=null,C]=(0,g.T)({prop:l,defaultProp:i,onChange:u}),[_,D]=d.useState(!1),I=(0,h.W)(m),M=N(n),A=d.useRef(!1),[E,V]=d.useState(0);return d.useEffect(()=>{let e=y.current;if(e)return e.addEventListener(v,I),()=>e.removeEventListener(v,I)},[I]),(0,r.jsx)(k,{scope:n,orientation:a,dir:S,loop:s,currentTabStopId:T,onItemFocus:d.useCallback(e=>C(e),[C]),onItemShiftTab:d.useCallback(()=>D(!0),[]),onFocusableItemAdd:d.useCallback(()=>V(e=>e+1),[]),onFocusableItemRemove:d.useCallback(()=>V(e=>e-1),[]),children:(0,r.jsx)(x.WV.div,{tabIndex:_||0===E?-1:0,"data-orientation":a,...w,ref:R,style:{outline:"none",...e.style},onMouseDown:(0,c.M)(e.onMouseDown,()=>{A.current=!0}),onFocus:(0,c.M)(e.onFocus,e=>{let t=!A.current;if(e.target===e.currentTarget&&t&&!_){let t=new CustomEvent(v,j);if(e.currentTarget.dispatchEvent(t),!t.defaultPrevented){let e=M().filter(e=>e.focusable);F([e.find(e=>e.active),e.find(e=>e.id===T),...e].filter(Boolean).map(e=>e.ref.current),p)}}A.current=!1}),onBlur:(0,c.M)(e.onBlur,()=>D(!1))})})}),I="RovingFocusGroupItem",M=d.forwardRef((e,t)=>{let{__scopeRovingFocusGroup:n,focusable:a=!0,active:s=!1,tabStopId:o,...l}=e,i=(0,p.M)(),u=o||i,m=C(I,n),f=m.currentTabStopId===u,h=N(n),{onFocusableItemAdd:g,onFocusableItemRemove:b}=m;return d.useEffect(()=>{if(a)return g(),()=>b()},[a,g,b]),(0,r.jsx)(y.ItemSlot,{scope:n,id:u,focusable:a,active:s,children:(0,r.jsx)(x.WV.span,{tabIndex:f?0:-1,"data-orientation":m.orientation,...l,ref:t,onMouseDown:(0,c.M)(e.onMouseDown,e=>{a?m.onItemFocus(u):e.preventDefault()}),onFocus:(0,c.M)(e.onFocus,()=>m.onItemFocus(u)),onKeyDown:(0,c.M)(e.onKeyDown,e=>{if("Tab"===e.key&&e.shiftKey){m.onItemShiftTab();return}if(e.target!==e.currentTarget)return;let t=function(e,t,n){var r;let a=(r=e.key,"rtl"!==n?r:"ArrowLeft"===r?"ArrowRight":"ArrowRight"===r?"ArrowLeft":r);if(!("vertical"===t&&["ArrowLeft","ArrowRight"].includes(a))&&!("horizontal"===t&&["ArrowUp","ArrowDown"].includes(a)))return A[a]}(e,m.orientation,m.dir);if(void 0!==t){if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;e.preventDefault();let a=h().filter(e=>e.focusable).map(e=>e.ref.current);if("last"===t)a.reverse();else if("prev"===t||"next"===t){var n,r;"prev"===t&&a.reverse();let s=a.indexOf(e.currentTarget);a=m.loop?(n=a,r=s+1,n.map((e,t)=>n[(r+t)%n.length])):a.slice(s+1)}setTimeout(()=>F(a))}})})})});M.displayName=I;var A={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function F(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=document.activeElement;for(let r of e)if(r===n||(r.focus({preventScroll:t}),document.activeElement!==n))return}var E=n(1383),V="Tabs",[Z,P]=(0,u.b)(V,[T]),U=T(),[L,z]=Z(V),K=d.forwardRef((e,t)=>{let{__scopeTabs:n,value:a,onValueChange:s,defaultValue:o,orientation:l="horizontal",dir:i,activationMode:d="automatic",...c}=e,u=(0,b.gm)(i),[m,f]=(0,g.T)({prop:a,onChange:s,defaultProp:o});return(0,r.jsx)(L,{scope:n,baseId:(0,p.M)(),value:m,onValueChange:f,orientation:l,dir:u,activationMode:d,children:(0,r.jsx)(x.WV.div,{dir:u,"data-orientation":l,...c,ref:t})})});K.displayName=V;var B="TabsList",G=d.forwardRef((e,t)=>{let{__scopeTabs:n,loop:a=!0,...s}=e,o=z(B,n),l=U(n);return(0,r.jsx)(_,{asChild:!0,...l,orientation:o.orientation,dir:o.dir,loop:a,children:(0,r.jsx)(x.WV.div,{role:"tablist","aria-orientation":o.orientation,...s,ref:t})})});G.displayName=B;var O="TabsTrigger",W=d.forwardRef((e,t)=>{let{__scopeTabs:n,value:a,disabled:s=!1,...o}=e,l=z(O,n),i=U(n),d=q(l.baseId,a),u=J(l.baseId,a),m=a===l.value;return(0,r.jsx)(M,{asChild:!0,...i,focusable:!s,active:m,children:(0,r.jsx)(x.WV.button,{type:"button",role:"tab","aria-selected":m,"aria-controls":u,"data-state":m?"active":"inactive","data-disabled":s?"":void 0,disabled:s,id:d,...o,ref:t,onMouseDown:(0,c.M)(e.onMouseDown,e=>{s||0!==e.button||!1!==e.ctrlKey?e.preventDefault():l.onValueChange(a)}),onKeyDown:(0,c.M)(e.onKeyDown,e=>{[" ","Enter"].includes(e.key)&&l.onValueChange(a)}),onFocus:(0,c.M)(e.onFocus,()=>{let e="manual"!==l.activationMode;m||s||!e||l.onValueChange(a)})})})});W.displayName=O;var H="TabsContent",Q=d.forwardRef((e,t)=>{let{__scopeTabs:n,value:a,forceMount:s,children:o,...l}=e,i=z(H,n),c=q(i.baseId,a),u=J(i.baseId,a),m=a===i.value,f=d.useRef(m);return d.useEffect(()=>{let e=requestAnimationFrame(()=>f.current=!1);return()=>cancelAnimationFrame(e)},[]),(0,r.jsx)(E.z,{present:s||m,children:n=>{let{present:a}=n;return(0,r.jsx)(x.WV.div,{"data-state":m?"active":"inactive","data-orientation":i.orientation,role:"tabpanel","aria-labelledby":c,hidden:!a,id:u,tabIndex:0,...l,ref:t,style:{...e.style,animationDuration:f.current?"0s":void 0},children:a&&o})}})});function q(e,t){return"".concat(e,"-trigger-").concat(t)}function J(e,t){return"".concat(e,"-content-").concat(t)}Q.displayName=H;var Y=n(9354);let $=d.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(G,{ref:t,className:(0,Y.cn)("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",n),...a})});$.displayName=G.displayName;let X=d.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(W,{ref:t,className:(0,Y.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",n),...a})});X.displayName=W.displayName,d.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(Q,{ref:t,className:(0,Y.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",n),...a})}).displayName=Q.displayName;var ee=n(7304),et=n(9888),en=n(2933);function er(e){var t,n,a;let{conf:s,onNowEvents:o,upcomingEvents:i,tags:c}=e,u=(0,l.useRouter)(),m=null!==(t=(0,l.useSearchParams)().get("tag"))&&void 0!==t?t:"0",[f,p]=(0,d.useState)(parseInt(m)),x=c.flatMap(e=>e.tags).find(e=>e.id===parseInt(m)),h=new Map([["On Now",("0"!==m?o.filter(e=>{var t;return null===(t=e.tags)||void 0===t?void 0:t.some(e=>e.id==f)}):o).sort((e,t)=>e.beginTimestampSeconds-t.beginTimestampSeconds)],["Upcoming",("0"!==m?i.filter(e=>{var t;return null===(t=e.tags)||void 0===t?void 0:t.some(e=>e.id==f)}):i).sort((e,t)=>e.beginTimestampSeconds-t.beginTimestampSeconds)]]),[g,b]=(0,d.useState)("On Now");return(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("div",{children:[(0,r.jsxs)("div",{className:"ml-2 md:ml-5 items-center grid bg-background mx-2 my-5 align-middle grid-cols-2 gap-1",children:[(0,r.jsx)("div",{children:(0,r.jsx)("h1",{className:"text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold font-mono ml-2",children:"On Now and Upcoming"})}),(0,r.jsx)("div",{className:"justify-self-end align-middle flex",children:(0,r.jsx)("span",{className:"mr-5",children:(0,r.jsxs)(et.Ph,{onValueChange:e=>{var t;p(null!==(t=parseInt(e))&&void 0!==t?t:0),u.push("/upcoming?conf=".concat(s.code,"&tag=").concat(e))},children:[(0,r.jsx)(et.i4,{className:"w-44 md:w-48",children:(0,r.jsx)(et.ki,{placeholder:null!==(n=null==x?void 0:x.label)&&void 0!==n?n:"Select a tag"})}),(0,r.jsxs)(et.Bw,{children:[(0,r.jsx)(et.DI,{children:(0,r.jsx)(et.Ql,{value:"0",children:"All events"})}),c.filter(e=>e.is_browsable&&e.tags.length>0&&"content"==e.category).sort((e,t)=>e.sort_order>t.sort_order?1:-1).map(e=>(0,r.jsxs)(et.DI,{children:[(0,r.jsx)(et.n5,{children:e.label}),e.tags.map(e=>(0,r.jsx)(et.Ql,{value:e.id.toString(),children:e.label},e.id))]},e.id))]})]})})})]}),(0,r.jsx)("div",{className:"mb-5 place-content-center flex ",children:(0,r.jsx)(K,{value:g,defaultValue:g,onValueChange:e=>{b(e)},children:(0,r.jsx)($,{children:Array.from(h.keys()).map(e=>(0,r.jsx)(X,{value:e,children:(0,r.jsx)("p",{className:"text-xs md:text-sm",children:e})},e))})})}),(0,r.jsx)("div",{className:"mb-10",children:(0,r.jsxs)(ee.iA,{className:"w-full",children:[(0,r.jsx)(ee.Rn,{children:"".concat(g," Events for ").concat(s.name)}),(0,r.jsx)(ee.RM,{children:(null!==(a=h.get(g))&&void 0!==a?a:[]).map(e=>(0,r.jsx)(en.Z,{conf:s.code,event:e},e.id))})]})})]})})}var ea=n(2901),es=n(2477);let eo=()=>{let e=(0,l.useSearchParams)().get("conf"),[t,n]=(0,d.useState)(!0),[c,u]=(0,d.useState)(null),[m,f]=(0,d.useState)(null),[p,x]=(0,d.useState)([]),[h,g]=(0,d.useState)([]),[b,v]=(0,d.useState)([]),[j,w]=(0,d.useState)([]);return((0,d.useEffect)(()=>{(async()=>{if(null===e){u("No conference code provided"),n(!1);return}try{let t=await (0,ea.Z)(),r=await (0,es.l7)(t,25),a=r.find(t=>t.code===e);if(void 0===a){u("Conference not found"),n(!1);return}let[o,l,i]=await Promise.all([(0,es.Zi)(t,a.code),(0,es.CP)(t,a.code),(0,es.NJ)(t,a.code)]),d=(0,s.mx)(o,null!=i?i:[]),c=(0,s.mx)(l,null!=i?i:[]);f(a),v(d),w(c),x(r),g(null!=i?i:[])}catch(e){u("An error occurred while fetching data")}finally{n(!1)}})()},[e]),t)?(0,r.jsx)(a.Z,{}):null!==c?(0,r.jsx)(o.Z,{msg:c}):null===m?(0,r.jsx)(o.Z,{msg:"Conference not found"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("title",{children:null==m?void 0:m.name}),(0,r.jsx)("meta",{name:"description",content:"".concat(null==m?void 0:m.name," Upcoming Events")}),(0,r.jsxs)("main",{children:[(0,r.jsx)(i.Z,{conf:m,conferences:p}),(0,r.jsx)(er,{conf:m,onNowEvents:b,upcomingEvents:j,tags:h})]})]})};function el(){return(0,r.jsx)(d.Suspense,{fallback:(0,r.jsx)(a.Z,{}),children:(0,r.jsx)(eo,{})})}},2933:function(e,t,n){"use strict";n.d(t,{Z:function(){return l}});var r=n(7437),a=n(880),s=n(7304),o=n(6463);function l(e){var t;let{conf:n,event:l}=e,i=(0,o.useRouter)(),d="../event?conf=".concat(n,"&event=").concat(l.id);return(0,r.jsxs)(s.SC,{id:"e-".concat(l.id),className:"cursor-pointer",onClick:()=>{i.push(d)},children:[(0,r.jsx)(s.pj,{className:"relative align-middle",children:(0,r.jsx)("div",{className:"absolute top-1 bottom-1 left-1 w-1 md:w-2 lg:w-3 rounded",style:{backgroundColor:l.color}})}),(0,r.jsx)(s.pj,{className:"align-middle",children:(0,r.jsx)("p",{className:"text-xs md:text-sm",children:(0,a.z4)(l.begin)})}),(0,r.jsx)(s.pj,{className:"align-middle hidden md:table-cell",children:(0,r.jsx)("p",{className:"text-xs md:text-sm",children:(0,a.z4)(l.end)})}),(0,r.jsx)(s.pj,{className:"align-middle",children:(0,r.jsxs)("a",{href:d,children:[(0,r.jsx)("h1",{className:"text-sm md:text-base font-bold break-words max-w-96 drop-shadow-sm",children:l.title}),(0,r.jsx)("p",{className:"text-xs md:text-sm mt-1 italic",children:l.speakers})]})}),(0,r.jsx)(s.pj,{className:"align-middle",children:(0,r.jsx)("p",{className:"text-xs md:text-sm",children:l.location})}),(0,r.jsx)(s.pj,{className:"align-middle",children:null===(t=l.tags)||void 0===t?void 0:t.sort((e,t)=>e.sort_order!==t.sort_order?e.sort_order-t.sort_order:e.label.localeCompare(t.label)).map(e=>(0,r.jsxs)("div",{className:"flex mr-2",children:[(0,r.jsx)("span",{style:{backgroundColor:e.color_background},className:"rounded-full h-2 w-2 inline-flex flex-none m-1"}),(0,r.jsx)("p",{className:"text-xs",children:e.label})]},e.id))})]})}n(2265)},9888:function(e,t,n){"use strict";n.d(t,{Bw:function(){return p},DI:function(){return d},Ph:function(){return i},Ql:function(){return h},i4:function(){return u},ki:function(){return c},n5:function(){return x}});var r=n(7437),a=n(2265),s=n(4867),o=n(7190),l=n(9354);let i=o.fC,d=o.ZA,c=o.B4,u=a.forwardRef((e,t)=>{let{className:n,children:a,...i}=e;return(0,r.jsxs)(o.xz,{ref:t,className:(0,l.cn)("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",n),...i,children:[a,(0,r.jsx)(o.JO,{asChild:!0,children:(0,r.jsx)(s.jnn,{className:"h-4 w-4 opacity-50"})})]})});u.displayName=o.xz.displayName;let m=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(o.u_,{ref:t,className:(0,l.cn)("flex cursor-default items-center justify-center py-1",n),...a,children:(0,r.jsx)(s.g8U,{})})});m.displayName=o.u_.displayName;let f=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(o.$G,{ref:t,className:(0,l.cn)("flex cursor-default items-center justify-center py-1",n),...a,children:(0,r.jsx)(s.v4q,{})})});f.displayName=o.$G.displayName;let p=a.forwardRef((e,t)=>{let{className:n,children:a,position:s="popper",...i}=e;return(0,r.jsx)(o.h_,{children:(0,r.jsxs)(o.VY,{ref:t,className:(0,l.cn)("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2","popper"===s&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",n),position:s,...i,children:[(0,r.jsx)(m,{}),(0,r.jsx)(o.l_,{className:(0,l.cn)("p-1","popper"===s&&"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),children:a}),(0,r.jsx)(f,{})]})})});p.displayName=o.VY.displayName;let x=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(o.__,{ref:t,className:(0,l.cn)("px-2 py-1.5 text-sm font-semibold",n),...a})});x.displayName=o.__.displayName;let h=a.forwardRef((e,t)=>{let{className:n,children:a,...i}=e;return(0,r.jsxs)(o.ck,{ref:t,className:(0,l.cn)("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",n),...i,children:[(0,r.jsx)("span",{className:"absolute right-2 flex h-3.5 w-3.5 items-center justify-center",children:(0,r.jsx)(o.wU,{children:(0,r.jsx)(s.nQG,{className:"h-4 w-4"})})}),(0,r.jsx)(o.eT,{children:a})]})});h.displayName=o.ck.displayName,a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)(o.Z0,{ref:t,className:(0,l.cn)("-mx-1 my-1 h-px bg-muted",n),...a})}).displayName=o.Z0.displayName},7304:function(e,t,n){"use strict";n.d(t,{RM:function(){return i},Rn:function(){return m},SC:function(){return d},iA:function(){return o},pj:function(){return u},ss:function(){return c},xD:function(){return l}});var r=n(7437),a=n(2265),s=n(9354);let o=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("div",{className:"relative w-full overflow-auto",children:(0,r.jsx)("table",{ref:t,className:(0,s.cn)("w-full caption-bottom text-sm",n),...a})})});o.displayName="Table";let l=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("thead",{ref:t,className:(0,s.cn)("[&_tr]:border-b",n),...a})});l.displayName="TableHeader";let i=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("tbody",{ref:t,className:(0,s.cn)("[&_tr:last-child]:border-0",n),...a})});i.displayName="TableBody",a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("tfoot",{ref:t,className:(0,s.cn)("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",n),...a})}).displayName="TableFooter";let d=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("tr",{ref:t,className:(0,s.cn)("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",n),...a})});d.displayName="TableRow";let c=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("th",{ref:t,className:(0,s.cn)("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",n),...a})});c.displayName="TableHead";let u=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("td",{ref:t,className:(0,s.cn)("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",n),...a})});u.displayName="TableCell";let m=a.forwardRef((e,t)=>{let{className:n,...a}=e;return(0,r.jsx)("caption",{ref:t,className:(0,s.cn)("mt-4 text-sm text-muted-foreground",n),...a})});m.displayName="TableCaption"},880:function(e,t,n){"use strict";function r(e){let t=new Date(e);return t.setHours(8,0,0),t.toLocaleDateString("en-US",{day:"numeric",month:"short"})}function a(e){let t=!(arguments.length>1)||void 0===arguments[1]||arguments[1];return new Date(e).toLocaleTimeString("en-US",{timeZoneName:t?"short":void 0,hour12:!1,day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}function s(e){return new Date(e).toLocaleString("en-US",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}function o(e){let t=!(arguments.length>1)||void 0===arguments[1]||arguments[1];return e.toLocaleTimeString("en-US",{timeZoneName:t?"short":void 0,weekday:"short",hour12:!1,day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}n.d(t,{HA:function(){return i},Os:function(){return r},fb:function(){return o},fk:function(){return s},z4:function(){return a}});let l=e=>e.sort((e,t)=>e.beginTimestampSeconds-t.beginTimestampSeconds).reduce((e,t)=>{var n;let r=new Date(t.begin).toLocaleTimeString("en-US",{timeZoneName:"short",day:"numeric",year:"numeric",month:"numeric",hour12:!1}).split(",").slice(0,1).join(),a=null!==(n=e.get(r))&&void 0!==n?n:[];return a.push(t),e.set(r,a),e},new Map),i=e=>new Map(Array.from(l(e)).map(e=>{let[t,n]=e;return[t,n.sort((e,t)=>e.beginTimestampSeconds-t.beginTimestampSeconds)]}))}},function(e){e.O(0,[837,310,139,156,190,196,971,23,744],function(){return e(e.s=8974)}),_N_E=e.O()}]);