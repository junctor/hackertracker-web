(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[329],{4176:function(e,r,n){Promise.resolve().then(n.bind(n,5058))},5058:function(e,r,n){"use strict";n.r(r),n.d(r,{default:function(){return x}});var t=n(7437),a=n(3764),s=n(1994),o=n(9039),l=n(5843),c=n(6463),d=n(418),i=n(2265),f=n(7304);function u(e){let{people:r,conf:n}=e,a=(0,c.useRouter)();return(0,t.jsx)(t.Fragment,{children:(0,t.jsxs)("div",{className:"mx-5 bg-background",children:[(0,t.jsx)("h1",{className:"font-bold text-base sm:text-lg md:text-xl lg:text-2xl",children:"".concat(n.name," People")}),(0,t.jsxs)(f.iA,{children:[(0,t.jsx)(f.Rn,{children:"People"}),(0,t.jsx)(f.RM,{children:r.sort((e,r)=>e.name.toLowerCase()>r.name.toLowerCase()?1:-1).map(e=>(0,t.jsx)(f.SC,{onClick:()=>a.push("/person?conf=".concat(n.code,"&person=").concat(e.id)),children:(0,t.jsx)(f.pj,{children:e.name})},e.id))})]})]})})}function m(){let e=(0,c.useSearchParams)().get("conf");if(null===e)return(0,t.jsx)(l.Z,{msg:"No conference provided"});let{data:r,error:n,isLoading:f}=(0,o.ZP)("../../../ht/index.json",s._i),{data:m,error:x,isLoading:p}=(0,o.ZP)("../../../ht/conferences/".concat(e.toUpperCase(),"/speakers.json"),s._i);if(p||f)return(0,t.jsx)(a.Z,{});if(void 0!==x||void 0!==n||void 0===m||void 0===r)return(0,t.jsx)(l.Z,{});let j=r.find(r=>r.code===e);return void 0===j?(0,t.jsx)(l.Z,{msg:"Conference not found"}):(0,t.jsxs)(i.Suspense,{fallback:(0,t.jsx)(a.Z,{}),children:[(0,t.jsx)("title",{children:"Speakers | ".concat(j.name)}),(0,t.jsx)("meta",{name:"description",content:"Speakers | ".concat(j.name," ")}),(0,t.jsx)("link",{rel:"icon",href:"/favicon.ico"}),(0,t.jsxs)("main",{children:[(0,t.jsx)(d.Z,{conf:j,conferences:r}),(0,t.jsx)(u,{people:m,conf:j})]})]})}function x(){return(0,t.jsx)(i.Suspense,{fallback:(0,t.jsx)("div",{children:"Loading..."}),children:(0,t.jsx)(m,{})})}},7304:function(e,r,n){"use strict";n.d(r,{RM:function(){return l},Rn:function(){return i},SC:function(){return c},iA:function(){return o},pj:function(){return d}});var t=n(7437),a=n(2265),s=n(9354);let o=a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("div",{className:"relative w-full overflow-auto",children:(0,t.jsx)("table",{ref:r,className:(0,s.cn)("w-full caption-bottom text-sm",n),...a})})});o.displayName="Table",a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("thead",{ref:r,className:(0,s.cn)("[&_tr]:border-b",n),...a})}).displayName="TableHeader";let l=a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("tbody",{ref:r,className:(0,s.cn)("[&_tr:last-child]:border-0",n),...a})});l.displayName="TableBody",a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("tfoot",{ref:r,className:(0,s.cn)("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",n),...a})}).displayName="TableFooter";let c=a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("tr",{ref:r,className:(0,s.cn)("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",n),...a})});c.displayName="TableRow",a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("th",{ref:r,className:(0,s.cn)("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",n),...a})}).displayName="TableHead";let d=a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("td",{ref:r,className:(0,s.cn)("p-4 align-middle [&:has([role=checkbox])]:pr-0",n),...a})});d.displayName="TableCell";let i=a.forwardRef((e,r)=>{let{className:n,...a}=e;return(0,t.jsx)("caption",{ref:r,className:(0,s.cn)("mt-4 text-sm text-muted-foreground",n),...a})});i.displayName="TableCaption"}},function(e){e.O(0,[310,532,231,864,971,23,744],function(){return e(e.s=4176)}),_N_E=e.O()}]);