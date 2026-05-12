import{al as y,ad as R,aN as K,g as Q,s as tt,a as et,b as at,y as rt,x as nt,c as p,l as W,d as it,L as st,O as lt,Y as ot,aO as ct,f as ut,E as pt,M as dt}from"./index-COrfsjXx.js";import{p as gt}from"./chunk-4BX2VUAB-CuO00dRm.js";import{p as ft}from"./wardley-RL74JXVD-CpRIsXCW.js";import{d as _}from"./arc-Bf7ENlkT.js";import"./min-CkPCZQ2E.js";import"./_baseUniq-4IyGii04.js";function ht(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function mt(t){return t}function vt(){var t=mt,a=ht,f=null,S=y(0),s=y(R),d=y(0);function l(e){var n,o=(e=K(e)).length,g,h,v=0,c=new Array(o),i=new Array(o),x=+S.apply(this,arguments),w=Math.min(R,Math.max(-R,s.apply(this,arguments)-x)),m,D=Math.min(Math.abs(w)/o,d.apply(this,arguments)),$=D*(w<0?-1:1),u;for(n=0;n<o;++n)(u=i[c[n]=n]=+t(e[n],n,e))>0&&(v+=u);for(a!=null?c.sort(function(A,C){return a(i[A],i[C])}):f!=null&&c.sort(function(A,C){return f(e[A],e[C])}),n=0,h=v?(w-o*$)/v:0;n<o;++n,x=m)g=c[n],u=i[g],m=x+(u>0?u*h:0)+$,i[g]={data:e[g],index:n,value:u,startAngle:x,endAngle:m,padAngle:D};return i}return l.value=function(e){return arguments.length?(t=typeof e=="function"?e:y(+e),l):t},l.sortValues=function(e){return arguments.length?(a=e,f=null,l):a},l.sort=function(e){return arguments.length?(f=e,a=null,l):f},l.startAngle=function(e){return arguments.length?(S=typeof e=="function"?e:y(+e),l):S},l.endAngle=function(e){return arguments.length?(s=typeof e=="function"?e:y(+e),l):s},l.padAngle=function(e){return arguments.length?(d=typeof e=="function"?e:y(+e),l):d},l}var xt=dt.pie,z={sections:new Map,showData:!1},T=z.sections,F=z.showData,yt=structuredClone(xt),St=p(()=>structuredClone(yt),"getConfig"),wt=p(()=>{T=new Map,F=z.showData,pt()},"clear"),At=p(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),W.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),Ct=p(()=>T,"getSections"),Dt=p(t=>{F=t},"setShowData"),$t=p(()=>F,"getShowData"),V={getConfig:St,clear:wt,setDiagramTitle:nt,getDiagramTitle:rt,setAccTitle:at,getAccTitle:et,setAccDescription:tt,getAccDescription:Q,addSection:At,getSections:Ct,setShowData:Dt,getShowData:$t},Tt=p((t,a)=>{gt(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),Et={parse:p(async t=>{const a=await ft("pie",t);W.debug(a),Tt(a,V)},"parse")},Mt=p(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),bt=Mt,kt=p(t=>{const a=[...t.values()].reduce((s,d)=>s+d,0),f=[...t.entries()].map(([s,d])=>({label:s,value:d})).filter(s=>s.value/a*100>=1);return vt().value(s=>s.value).sort(null)(f)},"createPieArcs"),Rt=p((t,a,f,S)=>{var P;W.debug(`rendering pie chart
`+t);const s=S.db,d=it(),l=st(s.getConfig(),d.pie),e=40,n=18,o=4,g=450,h=g,v=lt(a),c=v.append("g");c.attr("transform","translate("+h/2+","+g/2+")");const{themeVariables:i}=d;let[x]=ot(i.pieOuterStrokeWidth);x??(x=2);const w=l.textPosition,m=Math.min(h,g)/2-e,D=_().innerRadius(0).outerRadius(m),$=_().innerRadius(m*w).outerRadius(m*w);c.append("circle").attr("cx",0).attr("cy",0).attr("r",m+x/2).attr("class","pieOuterCircle");const u=s.getSections(),A=kt(u),C=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let E=0;u.forEach(r=>{E+=r});const L=A.filter(r=>(r.data.value/E*100).toFixed(0)!=="0"),M=ct(C).domain([...u.keys()]);c.selectAll("mySlices").data(L).enter().append("path").attr("d",D).attr("fill",r=>M(r.data.label)).attr("class","pieCircle"),c.selectAll("mySlices").data(L).enter().append("text").text(r=>(r.data.value/E*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice");const U=c.append("text").text(s.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),N=[...u.entries()].map(([r,k])=>({label:r,value:k})),b=c.selectAll(".legend").data(N).enter().append("g").attr("class","legend").attr("transform",(r,k)=>{const I=n+o,q=I*N.length/2,H=12*n,J=k*I-q;return"translate("+H+","+J+")"});b.append("rect").attr("width",n).attr("height",n).style("fill",r=>M(r.label)).style("stroke",r=>M(r.label)),b.append("text").attr("x",n+o).attr("y",n-o).text(r=>s.getShowData()?`${r.label} [${r.value}]`:r.label);const j=Math.max(...b.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0)),X=h+e+n+o+j,O=((P=U.node())==null?void 0:P.getBoundingClientRect().width)??0,Y=h/2-O/2,Z=h/2+O/2,G=Math.min(0,Y),B=Math.max(X,Z)-G;v.attr("viewBox",`${G} 0 ${B} ${g}`),ut(v,g,B,l.useMaxWidth)},"draw"),Wt={draw:Rt},Pt={parser:Et,db:V,renderer:Wt,styles:bt};export{Pt as diagram};
