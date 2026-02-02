import{T as m,a as e}from"./index-D_4M6pYn.js";import{b as t}from"./web-BLxQRK1u.js";const i={title:"LZR",description:`Little Zine Revolution.

Zines are like little love notes.  They foster creativity, build
community and provide an uncensored platform for diverse voices.

Revolution is love.`,image:"/meta-image.png",url:"/"},c="https://dev.lzr.life";function d(n){const o=n.title??i.title,r=n.description??i.description,a=new URL(n.image??i.image,c).toString(),l=new URL(n.url??i.url,c).toString(),s=n.ogType??"website";return[t(m,{children:o}),t(e,{name:"description",content:r}),t(e,{property:"og:type",content:s}),t(e,{property:"og:title",content:o}),t(e,{property:"og:description",content:r}),t(e,{property:"og:image",content:a}),t(e,{property:"og:url",content:l}),t(e,{name:"twitter:card",content:"summary_large_image"}),t(e,{name:"twitter:title",content:o}),t(e,{name:"twitter:description",content:r}),t(e,{name:"twitter:image",content:a})]}export{d as M};
