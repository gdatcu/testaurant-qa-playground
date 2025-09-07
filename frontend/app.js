// i18n + currency + images + stats dashboard
const $ = (s)=>document.querySelector(s);
let CART=[]; let page=1; const limit=8; let LANG='en'; let CUR='RON';

const I18N={
  en:{menu_title:'Menu',refresh:'Refresh',prev:'Prev',next:'Next',cart_title:'Cart',pickup:'Pickup',delivery:'Delivery',update_totals:'Update totals',name:'Name',phone:'Phone',card:'Card',cash:'Cash',checkout:'Checkout',admin_title:'Admin',list_orders:'List Orders',load_inventory:'Load Inventory',load_stats:'Load Stats',orders:'Orders',inventory:'Inventory',stats:'Stats',search:'Search...',coupon:'Coupon...',addr1:'Address line 1',city:'City',postal:'Postal code'},
  ro:{menu_title:'Meniu',refresh:'Reîmprospătează',prev:'Înapoi',next:'Înainte',cart_title:'Coș',pickup:'Ridicare',delivery:'Livrare',update_totals:'Calculează totalul',name:'Nume',phone:'Telefon',card:'Card',cash:'Numerar',checkout:'Plasează comanda',admin_title:'Admin',list_orders:'Listează comenzi',load_inventory:'Inventar',load_stats:'Statistici',orders:'Comenzi',inventory:'Inventar',stats:'Statistici',search:'Caută...',coupon:'Cupon...',addr1:'Adresă',city:'Oraș',postal:'Cod poștal'}
};
function t(key){ return (I18N[LANG]&&I18N[LANG][key])||key; }
function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=t(el.dataset.i18n); });
  document.querySelectorAll('[data-ph]').forEach(el=>{ el.placeholder=t(el.dataset.ph); });
}

function apiBase(){ return $('#apiBase').value.replace(/\/+$/,''); }
function apiRoot(){ const b=apiBase(); return b.endsWith('/api')?b:`${b}/api`; }
function money(n){ return new Intl.NumberFormat(LANG==='ro'?'ro-RO':'en-US',{style:'currency',currency:CUR}).format(+n); }

function notify(message,type='info',ms=3000){ let host=$('#toaster'); if(!host){host=document.createElement('div'); host.id='toaster'; document.body.appendChild(host);}
  const el=document.createElement('div'); el.className=`toast ${type==='success'?'success':type==='error'?'error':type==='warn'?'warn':''}`;
  el.innerHTML=`<div class="msg">${message}</div><button class="close" aria-label="Close">&times;</button>`; el.querySelector('.close').onclick=()=>host.removeChild(el);
  host.appendChild(el); if(ms>0) setTimeout(()=>{ if(el.parentNode===host) host.removeChild(el); }, ms);
}

async function ping(){ try{ const r=await fetch(`${apiRoot()}/health`); const d=await r.json(); if(!r.ok) throw new Error(d?.error||`HTTP ${r.status}`); notify('API health OK','success'); }catch(e){ notify('Health failed: '+e.message,'error',6000);} }

async function loadCategories(){ try{ const r=await fetch(`${apiRoot()}/categories`); if(!r.ok) return; const d=await r.json(); const sel=$('#category'); sel.innerHTML='<option value=\"\">All</option>'+(d.categories||[]).map(c=>`<option>${c}</option>`).join(''); }catch{} }

async function loadMenu(){
  const params = new URLSearchParams({page:String(page),limit:String(limit),currency:CUR});
  const q=$('#search').value.trim(); if(q) params.set('q',q);
  const cat=$('#category').value; if(cat) params.set('category',cat);
  try{
    const r=await fetch(`${apiRoot()}/menu?${params.toString()}`);
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.error||`HTTP ${r.status}`);
    $('#menu').innerHTML = (d.items||[]).map(it=>{
      const img = it.image_url ? `<img src="${it.image_url}" alt="${it.name}">` : '<img alt="no image">';
      const price = it.price_converted ?? it.price;
      return `
        <div class="item">
          ${img}
          <h3>${it.name}</h3>
          <div class="badges">
            ${it.category?`<span class="badge">${it.category}</span>`:''}
            <span class="badge ${(+it.stock<=0)?'zero':''}">Stock: ${it.stock ?? '-'}</span>
          </div>
          <div class="row">
            <div class="price">${money(price)}</div>
            <button class="btn" data-id="${it.id}" ${(+it.stock<=0)?'disabled':''}>${LANG==='ro'?'Adaugă':'Add'}</button>
          </div>
        </div>`;
    }).join('');
    $('#menu').querySelectorAll('button[data-id]').forEach(b=>b.onclick=()=>addToCart(parseInt(b.dataset.id,10)));
    $('#pageInfo').textContent = `Page ${page}`;
    notify('Menu loaded','success',1500);
  }catch(e){ $('#menu').innerHTML=`<div class="item">Failed to load menu: ${e.message}</div>`; notify('Load menu failed: '+e.message,'error',6000); }
}

function addToCart(id){ const ex=CART.find(i=>i.id===id); if(ex) ex.qty+=1; else CART.push({id,qty:1}); renderCart(); updateQuote(); notify('Added to cart','success',1200); }
function renderCart(){ if(CART.length===0){ $('#cart').innerHTML='(empty)'; return; }
  $('#cart').innerHTML=CART.map(i=>`
    <div class="cart-row">
      <span>Item #${i.id}</span>
      <div>
        <button class="btn" data-act="dec" data-id="${i.id}">-</button>
        <strong style="margin:0 8px">${i.qty}</strong>
        <button class="btn" data-act="inc" data-id="${i.id}">+</button>
        <button class="btn" data-act="del" data-id="${i.id}">x</button>
      </div>
    </div>`).join('');
  $('#cart').querySelectorAll('button').forEach(b=>{
    const id=parseInt(b.dataset.id,10); const act=b.dataset.act; const idx=CART.findIndex(x=>x.id===id);
    b.onclick=()=>{ if(idx===-1) return;
      if(act==='inc') CART[idx].qty++; if(act==='dec') CART[idx].qty=Math.max(1,CART[idx].qty-1); if(act==='del') CART.splice(idx,1);
      renderCart(); updateQuote(); notify(`Cart ${act}`,'success',1000);
    };
  });
}

async function updateQuote(){
  if(CART.length===0){ $('#quote').textContent=''; return; }
  const body={ items:CART.map(i=>({id:i.id,qty:i.qty})), couponCode:$('#coupon').value||null, deliveryMethod:$('#delivery').value, currency:CUR };
  try{
    const r=await fetch(`${apiRoot()}/cart/price?currency=${CUR}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.error||`HTTP ${r.status}`);
    const total = d.grandTotal_converted ?? d.grandTotal;
    const sub   = d.subtotal_converted ?? d.subtotal;
    const disc  = d.discount_converted ?? d.discount;
    const vat   = d.vat_converted ?? d.vat;
    const del   = d.deliveryFee_converted ?? d.deliveryFee;
    $('#quote').innerHTML = `${LANG==='ro'?'Subtotal':'Subtotal'}: <b>${money(sub)}</b> • ${LANG==='ro'?'Reducere':'Discount'}: <b>${money(disc)}</b> • VAT: <b>${money(vat)}</b> • ${LANG==='ro'?'Livrare':'Delivery'}: <b>${money(del)}</b> → <b>${LANG==='ro'?'Total':'Total'}: ${money(total)}</b>`;
    notify('Totals updated','success',1000);
  }catch(e){ $('#quote').textContent='Quote error: '+e.message; notify('Totals failed: '+e.message,'error',5000); }
}

async function checkout(){
  if(CART.length===0){ notify('Cart is empty','warn'); return; }
  const body={ customerName:$('#custName').value||'John Tester', customerPhone:$('#custPhone').value||'+40123456789',
    items:CART.map(i=>({id:i.id,qty:i.qty})), paymentMethod:$('#payMethod').value, deliveryMethod:$('#delivery').value,
    addressLine1:$('#addr1').value||null, city:$('#city').value||null, postalCode:$('#postal').value||null, couponCode:$('#coupon').value||null, currency:CUR };
  const headers={'Content-Type':'application/json'}; const idem=$('#idem').value.trim(); if(idem) headers['Idempotency-Key']=idem;
  try{
    const r=await fetch(`${apiRoot()}/checkout?currency=${CUR}`,{method:'POST',headers,body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.error||`HTTP ${r.status}`);
    const disp = d.displayTotal ?? d.total;
    $('#checkoutResult').textContent=`Order #${d.orderId} • ${money(disp)} (${d?.payment?.status})`;
    notify(`Checkout OK — Order #${d.orderId}`,'success',4000);
    CART=[]; renderCart(); $('#quote').textContent=''; loadMenu();
  }catch(e){ $('#checkoutResult').textContent='Error: '+e.message; notify('Checkout failed: '+e.message,'error',6000); }
}

async function listOrders(){
  const key=$('#adminKey').value.trim(); if(!key){ notify('Admin key required','warn'); return; }
  try{
    const r=await fetch(`${apiRoot()}/orders?page=1&limit=20&currency=${CUR}`,{headers:{'X-API-Key':key}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.error||`HTTP ${r.status}`);
    $('#orders').innerHTML=(d.orders||[]).map(o=>{
      const price = o.total_amount_display ?? o.total_amount;
      return `<div class="item"><div class="row"><strong>#${o.id}</strong><span>${o.status}</span></div><div class="row"><span>${o.customer_name}</span><span>${money(price)}</span></div><small class="muted">${o.created_at}</small></div>`;
    }).join('');
    notify(`Loaded ${d.orders?.length||0} orders`,'success',1500);
  }catch(e){ $('#orders').innerHTML=`<div class="item">Error: ${e.message}</div>`; notify('Orders failed: '+e.message,'error',6000); }
}

async function loadInventory(){
  const key=$('#adminKey').value.trim(); if(!key){ notify('Admin key required','warn'); return; }
  try{
    const r=await fetch(`${apiRoot()}/inventory`,{headers:{'X-API-Key':key}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.error||`HTTP ${r.status}`);
    $('#inventory').innerHTML=(d.items||[]).map(it=>`
      <div class="item">
        <h3>${it.name}</h3>
        <div class="badges">
          ${it.category?`<span class="badge">${it.category}</span>`:''}
          <span class="badge ${(+it.stock<=0)?'zero':''}">Stock: ${it.stock}</span>
        </div>
        <div class="row">
          <input class="stock-input" type="number" min="0" value="${it.stock}" data-id="${it.id}" style="width:90px;background:#0b1330;border:1px solid rgba(255,255,255,.08);color:#e9eefb;padding:6px;border-radius:8px">
          <div>
            <button class="btn" data-act="set" data-id="${it.id}">Update</button>
            <button class="btn" data-act="add" data-id="${it.id}">+10</button>
            <button class="btn" data-act="add5" data-id="${it.id}">+5</button>
            <button class="btn" data-act="sub" data-id="${it.id}">-1</button>
          </div>
        </div>
      </div>
    `).join('');
    $('#inventory').querySelectorAll('button').forEach(b=>{
      const id=parseInt(b.dataset.id,10); const act=b.dataset.act;
      b.onclick=async()=>{
        const input = b.closest('.item').querySelector('.stock-input');
        let val = parseInt(input.value,10)||0; const key=$('#adminKey').value.trim();
        try{
          if(act==='set'){ await apiSetStock(id, val, key); }
          else if(act==='add'){ await apiRestock(id, 10, key); input.value = val+10; }
          else if(act==='add5'){ await apiRestock(id, 5, key); input.value = val+5; }
          else if(act==='sub'){ await apiRestock(id, -1, key); input.value = Math.max(0, val-1); }
          notify('Stock updated','success',1200); loadMenu();
        }catch(e){ notify('Stock update failed: '+e.message,'error',5000); }
      };
    });
  }catch(e){ $('#inventory').innerHTML=`<div class="item">Error: ${e.message}</div>`; notify('Inventory failed: '+e.message,'error',6000); }
}

async function apiSetStock(id,val,key){
  const r=await fetch(`${apiRoot()}/menuitems/${id}/stock`,{method:'PUT',headers:{'Content-Type':'application/json','X-API-Key':key},body:JSON.stringify({stock:val})});
  if(!r.ok){ const d=await r.json().catch(()=>({})); throw new Error(d?.error||`HTTP ${r.status}`); }
}
async function apiRestock(id,delta,key){
  const r=await fetch(`${apiRoot()}/menuitems/${id}/restock`,{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':key},body:JSON.stringify({delta})});
  if(!r.ok){ const d=await r.json().catch(()=>({})); throw new Error(d?.error||`HTTP ${r.status}`); }
}

async function loadStats(){
  const key=$('#adminKey').value.trim(); if(!key){ notify('Admin key required','warn'); return; }
  const today = new Date(); const from = new Date(today.getTime()-6*86400000);
  const qs = new URLSearchParams({from: from.toISOString().slice(0,10), to: today.toISOString().slice(0,10), currency: CUR}).toString();
  try{
    const r=await fetch(`${apiRoot()}/stats?${qs}`,{headers:{'X-API-Key':key}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.error||`HTTP ${r.status}`);
    const total = d.revenue_display ?? d.revenue_sum;
    const rows = (d.by_day||[]).map(x=>`<tr><td>${x.d}</td><td>${x.c}</td><td>${money(x.s_display ?? x.s)}</td></tr>`).join('');
    const top = (d.top_items||[]).map(x=>`<tr><td>${x.name}</td><td>${x.qty}</td><td>${money(x.revenue_display ?? x.revenue)}</td></tr>`).join('');
    $('#stats').innerHTML = `
      <div class="item">
        <div class="row"><strong>${LANG==='ro'?'Comenzi':'Orders'}:</strong> ${d.orders_count}</div>
        <div class="row"><strong>${LANG==='ro'?'Venit':'Revenue'}:</strong> ${money(total)}</div>
      </div>
      <div class="item">
        <h3>${LANG==='ro'?'Pe zile':'By day'}</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th>Date</th><th>#</th><th>${LANG==='ro'?'Venit':'Revenue'}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="item">
        <h3>${LANG==='ro'?'Top produse':'Top items'}</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr><th>Item</th><th>Qty</th><th>${LANG==='ro'?'Venit':'Revenue'}</th></tr></thead>
          <tbody>${top}</tbody>
        </table>
      </div>
    `;
    notify('Stats loaded','success',1500);
  }catch(e){ $('#stats').innerHTML=`<div class="item">Error: ${e.message}</div>`; notify('Stats failed: '+e.message,'error',6000); }
}

// UI events
$('#btnHealth').onclick=ping;
$('#btnLoadMenu').onclick=()=>{ page=1; loadMenu(); };
$('#prevPage').onclick=()=>{ page=Math.max(1,page-1); loadMenu(); };
$('#nextPage').onclick=()=>{ page+=1; loadMenu(); };
$('#search').oninput=()=>{ page=1; loadMenu(); };
$('#category').onchange=()=>{ page=1; loadMenu(); };
$('#btnQuote').onclick=updateQuote;
$('#btnCheckout').onclick=checkout;
$('#btnListOrders').onclick=listOrders;
$('#btnLoadInventory').onclick=loadInventory;
$('#btnLoadStats').onclick=loadStats;
$('#delivery').onchange=()=>{ const d=$('#delivery').value==='delivery'; $('#address').style.display=d?'flex':'none'; updateQuote(); };

$('#lang').onchange=()=>{ LANG=$('#lang').value; applyI18n(); loadMenu(); updateQuote(); listOrders(); }
$('#currencySel').onchange=()=>{ CUR=$('#currencySel').value; loadMenu(); updateQuote(); listOrders(); loadStats(); };

// init
applyI18n(); loadCategories(); loadMenu(); renderCart(); updateQuote(); $('#address').style.display='none';

// --- Tabs wiring (switch visible panel) ---
(function wireTabs(){
  const tabs = document.querySelectorAll('.tab');
  if (!tabs.length) return;
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById(t.dataset.tab);
      if (panel) panel.classList.remove('hidden');
    });
  });
})();

// --- Harden buttons: make functions callable + idempotent wiring ---
window.loadInventory = loadInventory;
window.loadStats = loadStats;
window.listOrders = listOrders;

function wireAdminButtonsOnce(){
  const map = [
    ['btnListOrders',  listOrders],
    ['btnLoadInventory', loadInventory],
    ['btnLoadStats',   loadStats],
  ];
  for (const [id, fn] of map) {
    const el = document.getElementById(id);
    if (el && !el.dataset.wired) { el.addEventListener('click', fn); el.dataset.wired = '1'; }
  }
}
document.addEventListener('DOMContentLoaded', wireAdminButtonsOnce);
wireAdminButtonsOnce();

