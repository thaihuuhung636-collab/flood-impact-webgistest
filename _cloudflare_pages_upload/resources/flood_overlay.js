
(function(){
  const cfg = window.FLOOD_QGIS2WEB_CONFIG || {};
  const layersCfg = Array.isArray(cfg.layers) ? cfg.layers : [];
  if (!window.ol || !window.map) {
    console.warn('Flood overlay: không tìm thấy OpenLayers map của qgis2web. Bỏ qua animation.');
    return;
  }
  function esc(v){return String(v == null ? '' : v).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function ensureScript(src, cb){
    if ([...document.scripts].some(s => (s.src || '').indexOf(src) >= 0)) { cb && cb(); return; }
    const s = document.createElement('script'); s.src = src; s.onload = function(){ cb && cb(); }; document.head.appendChild(s);
  }
  // Global switch used by patched qgis2web popup function.
  window.FLOOD_CLICK_OBJECT_ENABLED = function(){
    const el = document.getElementById('floodClickObjMode');
    return !!(el && el.checked);
  };
  function layerNameFromPopupNode(root){
    const b = root.querySelector('a b, b');
    return b ? b.textContent.trim() : '';
  }
  function tableFromQgis2webPopup(html){
    const tmp = document.createElement('div'); tmp.innerHTML = html || '';
    const layerName = layerNameFromPopupNode(tmp);
    let rows = [];
    tmp.querySelectorAll('tr').forEach(function(tr){
      const th = tr.querySelector('th');
      const td = tr.querySelector('td');
      let key = th ? th.textContent.trim() : '';
      let val = td ? td.textContent.trim() : tr.textContent.trim();
      if (!key && !val) return;
      if (!key) key = 'Giá trị';
      rows.push('<tr><th>'+esc(key)+'</th><td>'+esc(val)+'</td></tr>');
    });
    if (!rows.length) rows.push('<tr><td colspan="2">Không có thuộc tính hoặc tất cả field đang ẩn</td></tr>');
    return '<div class="muted">Layer: '+esc(layerName)+'</div><table class="floodAttrTable">'+rows.join('')+'</table>';
  }
  window.floodShowQgis2WebAttributePanel = function(html){
    if (!window.FLOOD_CLICK_OBJECT_ENABLED()) { window.floodHideAttributePanel(); return; }
    let panel = document.getElementById('floodAttrPanel');
    if (!panel) {
      panel = document.createElement('div'); panel.id = 'floodAttrPanel'; panel.style.display='none';
      document.body.appendChild(panel);
    }
    panel.innerHTML = '<h3>Thuộc tính đối tượng</h3>' + tableFromQgis2webPopup(html) + '<div><button id="floodCloseAttr">Đóng bảng thuộc tính</button></div>';
    panel.style.display = 'block';
    const btn = document.getElementById('floodCloseAttr');
    if (btn) btn.onclick = window.floodHideAttributePanel;
  };
  window.floodHideAttributePanel = function(){
    const panel = document.getElementById('floodAttrPanel');
    if (panel) panel.style.display = 'none';
    const popup = document.getElementById('popup');
    if (popup) popup.style.display = 'none';
  };

  if (!layersCfg.length) return;
  const state = {frame:0,timer:null,layers:{},active:new Set(),points:[],series:[]};
  const floodBasemaps = {};
  function addFloodBasemaps(){
    try {
      if (!window.ol || !window.map || map._floodBasemapsAdded) return;
      floodBasemaps.street = new ol.layer.Tile({title:'Bản đồ phố', zIndex:-100, visible:false, source:new ol.source.XYZ({url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', attributions:'Tiles © Esri'})});
      floodBasemaps.satellite = new ol.layer.Tile({title:'Bản đồ vệ tinh', zIndex:-99, visible:false, source:new ol.source.XYZ({url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attributions:'Imagery © Esri'})});
      floodBasemaps.osm = new ol.layer.Tile({title:'Bản đồ phố mở', zIndex:-101, visible:false, source:new ol.source.OSM()});
      Object.keys(floodBasemaps).forEach(function(k){ map.addLayer(floodBasemaps[k]); });
      map._floodBasemapsAdded = true;
      window.floodSetBasemap = function(v){ Object.keys(floodBasemaps).forEach(function(k){ floodBasemaps[k].setVisible(k===v); }); };
      window.floodSetBasemap(cfg.defaultBasemap || 'street');
      try { if (map.getView().setMinZoom) map.getView().setMinZoom(0); } catch(e) {}
      try { map.getView().setProperties({extent: undefined}); } catch(e) {}
    } catch(e) { console.warn('Flood basemap init failed', e); }
  }
  const pointSrc = new ol.source.Vector();
  const pointLayer = new ol.layer.Vector({
    source: pointSrc,
    style: new ol.style.Style({
      image:new ol.style.Circle({radius:5,fill:new ol.style.Fill({color:'#e53935'}),stroke:new ol.style.Stroke({color:'#fff',width:2})}),
      text:new ol.style.Text({font:'12px Arial',offsetY:-13,fill:new ol.style.Fill({color:'#b71c1c'}),stroke:new ol.style.Stroke({color:'#fff',width:3}),text:function(f){return f.get('label')||'';}})
    })
  });
  pointLayer.set('title','Flood timeseries points');
  map.addLayer(pointLayer);

  function buildPanel(){
    const p = document.createElement('div'); p.id='floodAnimPanel';
    p.innerHTML = '<div class="floodTitle">Animation ngập lụt</div>'+
      '<div id="floodLayersBox"></div>'+
      '<div class="row"><label>Bản đồ nền</label><select id="floodBasemap"><option value="street">Phố</option><option value="satellite">Vệ tinh</option><option value="osm">Phố mở</option><option value="none">Không nền</option></select></div>'+
      '<div class="row"><button id="floodPrev">⏮</button><button id="floodPlay">▶</button><button id="floodPause">⏸</button><button id="floodNext">⏭</button></div>'+
      '<input id="floodFrame" type="range" min="0" max="0" value="0">'+
      '<div class="row"><b id="floodTime">--</b><span id="floodFrameText" class="muted"></span></div>'+
      '<div class="row"><label class="mode"><input id="floodClickObjMode" type="checkbox" checked> Click chọn đối tượng nền</label><label class="mode"><input id="floodClickTsMode" type="checkbox"> Click hiển thị timeseries ngập</label></div>';
    document.body.appendChild(p);
    const box = document.getElementById('floodLayersBox');
    layersCfg.forEach(function(l,idx){
      box.insertAdjacentHTML('beforeend','<label><input type="checkbox" class="floodLayerCb" data-id="'+esc(l.id)+'" '+(idx===0?'checked':'')+'> '+esc(l.caption||l.alias||l.id)+'</label>');
    });
    document.getElementById('floodPrev').onclick = function(){ setFrame(state.frame-1); };
    document.getElementById('floodNext').onclick = function(){ setFrame(state.frame+1); };
    document.getElementById('floodPlay').onclick = function(){ clearInterval(state.timer); state.timer=setInterval(function(){ setFrame((state.frame+1)%((Number(document.getElementById('floodFrame').max)||0)+1)); }, 450); };
    document.getElementById('floodPause').onclick = function(){ clearInterval(state.timer); };
    const bm = document.getElementById('floodBasemap');
    if (bm) { bm.value = cfg.defaultBasemap || 'street'; bm.onchange = function(e){ if(window.floodSetBasemap) window.floodSetBasemap(e.target.value); }; }
    document.getElementById('floodFrame').oninput = function(e){ setFrame(e.target.value); };
    document.querySelectorAll('.floodLayerCb').forEach(function(cb){ cb.onchange=function(){ const id=cb.dataset.id; if(cb.checked) state.active.add(id); else state.active.delete(id); if(state.layers[id]) state.layers[id].setVisible(cb.checked); refresh(true); }; if(cb.checked) state.active.add(cb.dataset.id); });
    const obj = document.getElementById('floodClickObjMode'); if (obj) obj.onchange=function(){ if(!obj.checked) window.floodHideAttributePanel(); };
  }
  function addFloodLayers(){
    layersCfg.forEach(function(l){
      const fr = (l.frames||[])[0]; if(!fr) return;
      const lyr = new ol.layer.Image({
        source: new ol.source.ImageStatic({url: fr.png, imageExtent: l.extent3857, projection:'EPSG:3857'}),
        opacity: Number(cfg.defaultAlpha || 0.7),
        visible: false
      });
      lyr.set('title','Flood - '+(l.caption||l.alias||l.id));
      lyr.set('floodLayer',true);
      state.layers[l.id]=lyr;
      map.addLayer(lyr);
    });
  }
  function setFrame(i){
    const slider = document.getElementById('floodFrame');
    const max = Number(slider ? slider.max : 0) || 0;
    state.frame = Math.max(0, Math.min(max, Number(i)||0));
    if(slider) slider.value = state.frame;
    const times=[];
    layersCfg.forEach(function(l){
      if(!state.active.has(l.id) || !state.layers[l.id]) return;
      const fr = l.frames[Math.min(state.frame, l.frames.length-1)];
      state.layers[l.id].setSource(new ol.source.ImageStatic({url: fr.png, imageExtent: l.extent3857, projection:'EPSG:3857'}));
      times.push((l.caption||l.alias||l.id)+': '+fr.time);
    });
    const ft = document.getElementById('floodFrameText'); if(ft) ft.textContent='Frame '+(state.frame+1)+'/'+(max+1);
    const tm = document.getElementById('floodTime'); if(tm) tm.textContent=times.join(' | ') || '--';
    drawChart();
  }
  function refresh(fit){
    let max=0, ext=null;
    layersCfg.forEach(function(l){
      if(state.active.has(l.id)){
        max=Math.max(max,(l.frames||[]).length-1);
        if(l.extent3857) ext = ext ? ol.extent.extend(ext,l.extent3857.slice()) : l.extent3857.slice();
      }
      if(state.layers[l.id]) state.layers[l.id].setVisible(state.active.has(l.id));
    });
    const slider=document.getElementById('floodFrame'); if(slider) slider.max=max;
    if(fit && ext) map.getView().fit(ext,{padding:[30,30,30,30],maxZoom:15});
    setFrame(state.frame);
  }
  const cache=new Map();
  async function openGeo(u){ if(cache.has(u))return cache.get(u); let t=await GeoTIFF.fromUrl(u), im=await t.getImage(), o={im:im,b:im.getBoundingBox()}; cache.set(u,o); return o; }
  async function sample(fr,xy){ let g=await openGeo(fr.tif),w=g.im.getWidth(),h=g.im.getHeight(),b=g.b; let px=Math.floor((xy[0]-b[0])/(b[2]-b[0])*w), py=Math.floor((b[3]-xy[1])/(b[3]-b[1])*h); px=Math.max(0,Math.min(w-1,px)); py=Math.max(0,Math.min(h-1,py)); let r=await g.im.readRasters({window:[px,py,px+1,py+1]}); return Number(Array.isArray(r)?(r[0][0]??r[0]):r[0]); }
  async function makeSeries(l,xy,ptLabel){ let vals=[]; for(let fr of l.frames) vals.push(await sample(fr,xy)); return {point:ptLabel,label:ptLabel+' · '+(l.caption||l.alias||l.id),times:l.frames.map(f=>f.time),values:vals}; }
  function ensureTsPanel(){
    let panel=document.getElementById('floodTsPanel');
    if(!panel){ panel=document.createElement('div'); panel.id='floodTsPanel'; panel.style.display='none'; panel.innerHTML='<h3>Timeseries vị trí</h3><div id="floodPointInfo" class="muted"></div><div id="floodChart"></div><div class="row"><button id="floodCsv">CSV timeseries</button><button id="floodSavePts">Lưu điểm CSV</button><button id="floodClearPts">Xóa điểm</button><button id="floodCloseTs">Đóng</button></div>'; document.body.appendChild(panel); document.getElementById('floodCloseTs').onclick=function(){panel.style.display='none';}; document.getElementById('floodClearPts').onclick=function(){pointSrc.clear();state.points=[];state.series=[];if(window.Plotly)Plotly.react('floodChart',[],{});panel.style.display='none';}; document.getElementById('floodCsv').onclick=function(){let rows=[['series','point','time','value']];state.series.forEach(s=>s.times.forEach((t,i)=>rows.push([s.label,s.point||'',t,s.values[i]])));let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));a.download='timeseries.csv';a.click();}; document.getElementById('floodSavePts').onclick=function(){let rows=[['label','lon','lat']];state.points.forEach(p=>rows.push([p.label,p.lon,p.lat]));let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));a.download='points.csv';a.click();}; }
    return panel;
  }
  function drawChart(){ if(!state.series.length||!window.Plotly)return; const panel=ensureTsPanel(); panel.style.display='block'; let traces=state.series.map(s=>({x:s.times,y:s.values,mode:'lines+markers',name:s.label})); let x0=state.series[0].times[Math.min(state.frame,state.series[0].times.length-1)]; Plotly.react('floodChart',traces,{margin:{l:55,r:18,t:20,b:55},showlegend:true,legend:{orientation:'h',y:-.22},shapes:[{type:'line',x0:x0,x1:x0,yref:'paper',y0:0,y1:1,line:{color:'red',width:2}}]},{responsive:true}); }
  async function addPointAtCoordinate(coord,label){
    ensureTsPanel().style.display='block';
    const ll = ol.proj.toLonLat(coord);
    pointSrc.addFeature(new ol.Feature({geometry:new ol.geom.Point(coord),label:label}));
    state.points.push({label:label,lon:ll[0],lat:ll[1]});
    const info=document.getElementById('floodPointInfo'); if(info) info.textContent='Đang lấy timeseries tại '+label+'...';
    for (let l of layersCfg.filter(l=>state.active.has(l.id))) { try { state.series.push(await makeSeries(l,coord,label)); } catch(e){ console.warn(e); } }
    if(info) info.textContent=state.points.length+' điểm · '+state.series.length+' chuỗi';
    drawChart();
  }
  map.on('singleclick', async function(evt){
    const ts=document.getElementById('floodClickTsMode');
    if(ts && ts.checked){ await addPointAtCoordinate(evt.coordinate,'P'+(state.points.length+1)); }
  });
  addFloodBasemaps(); buildPanel(); addFloodLayers(); refresh(false);
  ensureScript('https://cdn.plot.ly/plotly-2.35.2.min.js');
  ensureScript('https://cdn.jsdelivr.net/npm/geotiff@2.1.3/dist-browser/geotiff.js');
})();
