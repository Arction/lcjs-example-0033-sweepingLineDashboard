(self.webpackChunk=self.webpackChunk||[]).push([[524],{44:(e,t,s)=>{const r=s(89),{lightningChart:i,Themes:a,emptyLine:n,AutoCursorModes:o,AxisTickStrategies:l,ColorHEX:h,SolidFill:c,PointShape:f}=r;fetch(document.head.baseURI+"examples/assets/0033/ecg.json").then((e=>e.json())).then((e=>{const t=new Array(6).fill(0).map(((e,t)=>({name:`ECG-${t+1}`,yMin:-2500,yMax:2500}))),s=i().Dashboard({numberOfColumns:1,numberOfRows:t.length}).setSplitterStyle(n),r=s.getTheme(),a=new c({color:r.isDark?h("#000000"):h("#ffffff")}),d=t.map(((e,t)=>{const i=s.createChartXY({columnIndex:0,rowIndex:t}).setTitle(e.name).setTitlePosition("series-left-top").setAutoCursorMode(o.disabled).setSeriesBackgroundFillStyle(a).setMouseInteractions(!1).setSeriesBackgroundStrokeStyle(n),h=i.getDefaultAxisX().setTickStrategy(l.Empty).setStrokeStyle(n).setScrollStrategy(void 0).setInterval({start:0,end:15e3,stopAxisAfter:!1}),d=i.getDefaultAxisY().setStrokeStyle(n).setInterval({start:e.yMin,end:e.yMax}).setTickStrategy(l.Empty),g=i.addLineSeries({dataPattern:{pattern:"ProgressiveX"},automaticColorIndex:t}).setName(e.name).setStrokeStyle((e=>e.setThickness(2))).setEffect(!1),y=i.addRectangleSeries().setEffect(!1),S=y.add({x1:0,y1:0,x2:0,y2:0}).setFillStyle(a).setStrokeStyle(n).setMouseInteractions(!1),m=i.addLineSeries({dataPattern:{pattern:"ProgressiveX"},automaticColorIndex:t}).setName(e.name).setStrokeStyle((e=>e.setThickness(2))).setEffect(!1),x=i.addPointSeries({pointShape:f.Circle}).setPointFillStyle(new c({color:r.examples.highlightPointColor})).setPointSize(5).setEffect(!1);let u=!1;return[m,g].forEach((e=>{e.onHighlight((e=>{u||(u=!0,m.setHighlight(e),g.setHighlight(e),u=!1)}))})),{chart:i,seriesLeft:m,seriesRight:g,seriesOverlayRight:y,figureOverlayRight:S,seriesHighlightLastPoints:x,axisX:h,axisY:d}}));let g=0,y=window.performance.now(),S=0;const m=()=>{const s=window.performance.now(),r=Math.floor(1e3*(s-y)/1e3)-S;if(r>0){const s=[];for(let t=0;t<r;t++){const r=1*(S+t),i=(S+t)%e.length,a={x:r,y:e[i]};s.push(a)}(e=>{let s=0;for(let r=0;r<t.length;r+=1){const t=e[r],i=d[r],a=t.map((e=>({x:e.x%15e3,y:e.y}))),n=a.length;s=Math.max(s,a[a.length-1].x);let o=0,l=!1;for(const e of a){const t=e.x<g;!0===t&&t!==l&&(o+=1),l=t}if(o>1)i.seriesRight.clear(),i.seriesLeft.clear();else if(1===o){let e=[],t=[];for(let s=0;s<n;s+=1)if(a[s].x<=g){e=a.slice(0,s),t=a.slice(s+1);break}i.seriesLeft.add(e);const s=i.seriesRight,r=i.seriesLeft;i.seriesLeft=s,i.seriesRight=r,i.seriesRight.setDrawOrder({seriesDrawOrderIndex:0}),i.seriesOverlayRight.setDrawOrder({seriesDrawOrderIndex:1}),i.seriesLeft.setDrawOrder({seriesDrawOrderIndex:2}),i.seriesLeft.clear(),i.seriesLeft.add(t)}else i.seriesLeft.add(a);const h=[a[a.length-1]];i.seriesHighlightLastPoints.clear().add(h)}const r=s+450;d.forEach((e=>{e.figureOverlayRight.setDimensions({x1:0,x2:r,y1:e.axisY.getInterval().start,y2:e.axisY.getInterval().end})})),g=s})(new Array(t.length).fill(0).map((e=>s))),S+=r}requestAnimationFrame(m)};m()}))}},e=>{e.O(0,[502],(()=>(44,e(e.s=44)))),e.O()}]);