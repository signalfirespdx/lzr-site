import{T as m,a as e}from"./index-CoKsC3qf.js";import{b as t}from"./web-B2jywrhc.js";const o={title:"LZR",description:`Little Zine Revolution.

Zines are like little love notes.  They foster creativity, build
community and provide an uncensored platform for diverse voices.

Revolution is love.`,image:"/meta-image.png",url:"/"},c="";function d(n){const i=n.title??o.title,r=n.description??o.description,a=new URL(n.image??o.image,c).toString(),s=new URL(n.url??o.url,c).toString(),l=n.ogType??"website";return[t(m,{children:i}),t(e,{name:"description",content:r}),t(e,{property:"og:type",content:l}),t(e,{property:"og:title",content:i}),t(e,{property:"og:description",content:r}),t(e,{property:"og:image",content:a}),t(e,{property:"og:url",content:s}),t(e,{name:"twitter:card",content:"summary_large_image"}),t(e,{name:"twitter:title",content:i}),t(e,{name:"twitter:description",content:r}),t(e,{name:"twitter:image",content:a})]}export{d as M};
