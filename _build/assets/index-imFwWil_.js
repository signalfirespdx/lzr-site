const A="auto";const r="--_masonry-layout-col-count",c="--_masonry-layout-gap";const d=new Map;function a(o,t,s){const e=parseFloat(o.getAttribute(t)||"");return isNaN(e)?s:e}function m(o,t,s){return isNaN(t)?Math.max(1,Math.ceil(o/s)):t}function f(o,t,s){const e=d.get(s);e!=null&&window.clearTimeout(e),d.set(s,window.setTimeout(o,t))}function b(o){let t=0,s=1/0;return o.forEach((e,n)=>{e<s&&(s=e,t=n)}),t}const g=document.createElement("template");g.innerHTML=`
  <style>
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: stretch;
    }

    .column {
	  max-width: calc((100% / var(${r}, 1) - ((var(${c}, 24px) * (var(${r}, 1) - 1) / var(${r}, 1)))));
	  width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .column:not(:last-child) {
      margin-inline-end: var(${c}, 24px);
    }

    .column ::slotted(*) {
      margin-block-end: var(${c}, 24px);
      box-sizing: border-box;
      width: 100%;
    }

    /* Hide the items that has not yet found the correct slot */
    #unset-items {
      opacity: 0;
      position: absolute;
      pointer-events: none;
    }
  </style>
  <div id="unset-items">
    <slot></slot>
  </div>
`;class p extends HTMLElement{static get observedAttributes(){return["maxcolwidth","gap","cols"]}set maxColWidth(t){this.setAttribute("maxcolwidth",t.toString())}get maxColWidth(){return a(this,"maxcolwidth",500)}set cols(t){this.setAttribute("cols",t.toString())}get cols(){return a(this,"cols",A)}set gap(t){this.setAttribute("gap",t.toString())}get gap(){return a(this,"gap",24)}set debounce(t){this.setAttribute("debounce",t.toString())}get debounce(){return a(this,"debounce",300)}get $columns(){return Array.from(this.shadowRoot.querySelectorAll(".column"))}constructor(){super(),this.debounceId=`layout_${Math.random()}`,this.ro=void 0,this.currentRequestAnimationFrameCallback=void 0,this.attachShadow({mode:"open"}).appendChild(g.content.cloneNode(!0)),this.onSlotChange=this.onSlotChange.bind(this),this.onResize=this.onResize.bind(this),this.layout=this.layout.bind(this),this.$unsetElementsSlot=this.shadowRoot.querySelector("#unset-items > slot")}connectedCallback(){this.$unsetElementsSlot.addEventListener("slotchange",this.onSlotChange),"ResizeObserver"in window?(this.ro=new ResizeObserver(this.onResize),this.ro.observe(this)):window.addEventListener("resize",this.onResize)}disconnectedCallback(){this.$unsetElementsSlot.removeEventListener("slotchange",this.onSlotChange),window.removeEventListener("resize",this.onResize),this.ro!=null&&this.ro.unobserve(this)}attributeChangedCallback(t){switch(t){case"gap":this.style.setProperty(c,`${this.gap}px`);break}this.scheduleLayout()}onSlotChange(){(this.$unsetElementsSlot.assignedNodes()||[]).filter(s=>s.nodeType===1).length>0&&this.layout()}onResize(t){const{width:s}=t!=null&&Array.isArray(t)&&t.length>0?t[0].contentRect:{width:this.offsetWidth};m(s,this.cols,this.maxColWidth)!==this.$columns.length&&this.scheduleLayout()}renderCols(t){const s=this.$columns;if(s.length!==t){for(const e of s)e.parentNode&&e.parentNode.removeChild(e);for(let e=0;e<t;e++){const n=document.createElement("div");n.classList.add("column"),n.setAttribute("part",`column column-${e}`);const l=document.createElement("slot");l.setAttribute("name",e.toString()),n.appendChild(l),this.shadowRoot.appendChild(n)}this.style.setProperty(r,t.toString())}}scheduleLayout(t=this.debounce){f(this.layout,t,this.debounceId)}layout(){this.currentRequestAnimationFrameCallback!=null&&window.cancelAnimationFrame(this.currentRequestAnimationFrameCallback),this.currentRequestAnimationFrameCallback=requestAnimationFrame(()=>{const t=this.gap,s=Array.from(this.children).filter(i=>i.nodeType===1),e=m(this.offsetWidth,this.cols,this.maxColWidth),n=Array(e).fill(0),l=[];for(const i of s){const E=i.getBoundingClientRect().height;let h=b(n);n[h]+=E+t;const u=h.toString();i.slot!==u&&l.push(()=>i.slot=u)}for(const i of l)i();this.renderCols(e)})}}customElements.define("masonry-layout",p);export{p as MasonryLayout};
