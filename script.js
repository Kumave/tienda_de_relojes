/* -------------------------
  Datos iniciales (ejemplo)
   En un proyecto real vendrían de una API / DB
---------------------------*/
const productos = [
  {
    id: "r1",
    nombre: "Clásico Oro",
    descripcion: "Movimiento mecánico, correa de cuero, caja de oro.",
    precio: 15000,
    material: "Oro 18k",
    movimiento: "Mecánico manual",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "r2",
    nombre: "Aventurero Titanio",
    descripcion: "Automático, resistente al agua, esfera negra texturada.",
    precio: 22000,
    material: "Titanio",
    movimiento: "Automático",
    img: "https://images.unsplash.com/photo-1519741497236-5a0b52a2f36d?auto=format&fit=crop&w=800&q=60"
  },
  {
    id: "r3",
    nombre: "Elegance Steel",
    descripcion: "Diseño minimalista, cristal zafiro, correa acero.",
    precio: 12000,
    material: "Acero inoxidable",
    movimiento: "Cuarzo de alta precisión",
    img: "https://images.unsplash.com/photo-1549921296-3b9b3cb320f9?auto=format&fit=crop&w=800&q=60"
  }
];

/* -------------------------
  Utilidades para localStorage
---------------------------*/
const LS_USERS = "tienda_users_v1";
const LS_SESSION = "tienda_session_v1";
const LS_CART = "tienda_cart_v1";
const LS_FAVS = "tienda_favs_v1";

function saveLS(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function readLS(key){ const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }

/* -------------------------
  Inicialización UI
---------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderCatalogo();
  setupComparador();
  setupAuthForms();
  setupCart();
  setupVisor();
  setupContacto();
});

/* -------------------------
  Render Catálogo
---------------------------*/
function renderCatalogo(){
  const container = document.getElementById("catalogo-list");
  container.innerHTML = "";
  productos.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <h4>${p.nombre}</h4>
      <p>${p.descripcion}</p>
      <p class="badge">${p.material} · ${p.movimiento}</p>
      <p><strong>${formatMoney(p.precio)} MXN</strong></p>
      <div style="display:flex;gap:8px; margin-top:8px;">
        <button class="btn-det" data-id="${p.id}">Ver detalles</button>
        <button class="btn-add" data-id="${p.id}">Añadir</button>
        <button class="btn-fav" data-id="${p.id}">❤</button>
      </div>
    `;
    container.appendChild(card);
  });

  // listeners
  container.querySelectorAll(".btn-add").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.id)));
  container.querySelectorAll(".btn-det").forEach(btn => btn.addEventListener("click", () => showDetalles(btn.dataset.id)));
  container.querySelectorAll(".btn-fav").forEach(btn => btn.addEventListener("click", () => toggleFav(btn.dataset.id)));
}

/* -------------------------
  Formato dinero
---------------------------*/
function formatMoney(n){ return n.toLocaleString("es-MX"); }

/* -------------------------
  Detalles (simple modal usando window.open)
---------------------------*/
function showDetalles(id){
  const p = productos.find(x => x.id === id);
  const win = window.open("", "_blank", "width=600,height=600");
  win.document.title = p.nombre;
  win.document.body.style.background = "#0b1220";
  win.document.body.style.color = "#fff";
  win.document.body.style.fontFamily = "Arial, sans-serif";
  win.document.body.innerHTML = `
    <div style="padding:18px;">
      <h2>${p.nombre}</h2>
      <img src="${p.img}" alt="${p.nombre}" style="width:100%;max-width:400px;border-radius:8px">
      <p>${p.descripcion}</p>
      <p><strong>Material:</strong> ${p.material}</p>
      <p><strong>Movimiento:</strong> ${p.movimiento}</p>
      <p><strong>Precio:</strong> ${formatMoney(p.precio)} MXN</p>
      <button id="fav">Favorito</button>
      <button id="add">Añadir al carrito</button>
    </div>
  `;
  win.document.getElementById("add").onclick = () => { addToCart(p.id); alert("Añadido al carrito"); };
  win.document.getElementById("fav").onclick = () => { toggleFav(p.id); alert("Favorito toggled"); };
}

/* -------------------------
  Comparador
---------------------------*/
function setupComparador(){
  const selA = document.getElementById("selectA");
  const selB = document.getElementById("selectB");

  productos.forEach(p => {
    const optA = document.createElement("option"); optA.value = p.id; optA.textContent = p.nombre;
    const optB = optA.cloneNode(true);
    selA.appendChild(optA); selB.appendChild(optB);
  });

  document.getElementById("form-comparador").addEventListener("submit", e => {
    e.preventDefault();
    const a = productos.find(p => p.id === selA.value);
    const b = productos.find(p => p.id === selB.value);
    if(!a || !b){ alert("Selecciona ambos relojes"); return; }
    renderComparacion(a,b);
  });
}

function renderComparacion(a,b){
  const out = document.getElementById("comparacion-result");
  out.innerHTML = `
    <h4>Comparación</h4>
    <table style="width:100%;border-collapse:collapse;color:#fff">
      <thead>
        <tr><th></th><th>${a.nombre}</th><th>${b.nombre}</th></tr>
      </thead>
      <tbody>
        <tr><td>Precio</td><td>${formatMoney(a.precio)}</td><td>${formatMoney(b.precio)}</td></tr>
        <tr><td>Material</td><td>${a.material}</td><td>${b.material}</td></tr>
        <tr><td>Movimiento</td><td>${a.movimiento}</td><td>${b.movimiento}</td></tr>
        <tr><td>Descripción</td><td>${a.descripcion}</td><td>${b.descripcion}</td></tr>
      </tbody>
    </table>
  `;
}

/* -------------------------
  Autenticación (registro/login básico)
---------------------------*/
function setupAuthForms(){
  const users = readLS(LS_USERS) || [];
  if(!users.length){
    // crear un usuario demo
    users.push({usuario:"demo", password:"demo123", email:"demo@tienda.com"});
    saveLS(LS_USERS, users);
  }

  const formLogin = document.getElementById("form-login");
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value;
    const stored = (readLS(LS_USERS) || []).find(u => u.usuario === user && u.password === pass);
    if(stored){
      saveLS(LS_SESSION, {usuario:stored.usuario,email:stored.email});
      showUserPanel();
      alert("Bienvenido " + stored.usuario);
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  });

  const formReg = document.getElementById("form-register");
  formReg.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("reg-user").value.trim();
    const pass = document.getElementById("reg-pass").value;
    const email = document.getElementById("reg-email").value.trim();

    const usersNow = readLS(LS_USERS) || [];
    if(usersNow.find(u => u.usuario === user)){ alert("El usuario ya existe"); return; }
    usersNow.push({usuario:user, password:pass, email});
    saveLS(LS_USERS, usersNow);
    alert("Cuenta creada. Ya puedes iniciar sesión.");
    formReg.reset();
  });

  document.getElementById("show-register").addEventListener("click", () => { document.getElementById("reg-user").focus(); });

  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    toggleUserPanel(false);
    alert("Sesión cerrada");
  });

  document.getElementById("btn-gencert").addEventListener("click", generateCertificate);

  // si hay sesión la mostramos
  if(readLS(LS_SESSION)) showUserPanel();
}

function showUserPanel(){
  const s = readLS(LS_SESSION);
  if(!s) return;
  document.getElementById("user-name").textContent = s.usuario;
  toggleUserPanel(true);
}
function toggleUserPanel(show){
  document.getElementById("user-panel").classList.toggle("hidden", !show);
  document.getElementById("form-login").closest(".auth-box").classList.toggle("hidden", show);
  document.getElementById("form-register").closest(".auth-box").classList.toggle("hidden", show);
}

/* -------------------------
  Favoritos
---------------------------*/
function toggleFav(id){
  const favs = readLS(LS_FAVS) || [];
  const idx = favs.indexOf(id);
  if(idx >= 0) favs.splice(idx,1); else favs.push(id);
  saveLS(LS_FAVS, favs);
  alert(idx >= 0 ? "Eliminado de favoritos" : "Añadido a favoritos");
}

/* -------------------------
  Carrito
---------------------------*/
function setupCart(){
  updateCartCount();
  document.getElementById("btn-carrito").addEventListener("click", () => {
    const dialog = document.getElementById("dialog-carrito");
    renderCartItems();
    dialog.showModal();
  });

  document.getElementById("btn-close-cart").addEventListener("click", () => document.getElementById("dialog-carrito").close());
  document.getElementById("btn-checkout").addEventListener("click", () => {
    alert("Pago simulado. Gracias por tu compra :)");
    saveLS(LS_CART, []); renderCartItems(); updateCartCount();
  });
}

function addToCart(id){
  const cart = readLS(LS_CART) || [];
  const item = cart.find(i => i.id === id);
  if(item) item.qty++;
  else cart.push({id, qty:1});
  saveLS(LS_CART, cart);
  updateCartCount();
  alert("Añadido al carrito");
}

function renderCartItems(){
  const list = document.getElementById("cart-items");
  const cart = readLS(LS_CART) || [];
  if(cart.length === 0){ list.innerHTML = "<p>Carrito vacío</p>"; document.getElementById("cart-total").textContent = "0"; return; }

  list.innerHTML = "";
  let total = 0;
  cart.forEach(ci => {
    const p = productos.find(x => x.id === ci.id);
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.marginBottom = "8px";
    row.innerHTML = `<div><strong>${p.nombre}</strong> x ${ci.qty}</div><div>${formatMoney(p.precio * ci.qty)}</div>`;
    list.appendChild(row);
    total += p.precio * ci.qty;
  });
  document.getElementById("cart-total").textContent = formatMoney(total);
}

function updateCartCount(){
  const cart = readLS(LS_CART) || [];
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cart-count").textContent = count;
}

/* -------------------------
  Visor 3D (simulado con canvas)
   - Dibuja esfera + manecillas girando
   - Soporta rotación con slider y animación
---------------------------*/
function setupVisor(){
  const canvas = document.getElementById("visor3D");
  const ctx = canvas.getContext("2d");
  let rotation = 0; // degrees
  let spinning = true;

  const rotInput = document.getElementById("rot");
  rotInput.addEventListener("input", () => {
    rotation = Number(rotInput.value);
    draw();
  });

  document.getElementById("toggle-spin").addEventListener("click", (e) => {
    spinning = !spinning;
    e.target.textContent = spinning ? "Pausar rotación" : "Reanudar rotación";
  });

  // animación
  function loop(){
    if(spinning){
      rotation = (rotation + 0.3) % 360;
      rotInput.value = Math.round(rotation);
    }
    draw();
    requestAnimationFrame(loop);
  }

  function draw(){
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // center
    const cx = w/2, cy = h/2;
    const radius = Math.min(w,h)*0.28;

    // fondo - suave degradado
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,"#0b1220");
    g.addColorStop(1,"#08101a");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // "caja" del reloj - elipse con sombra
    ctx.save();
    ctx.translate(cx,cy);
    const rad = radius * 1.2;
    // efecto de rotación simulado elevando sombra
    ctx.rotate(rotation * Math.PI/180 * 0.02);
    ctx.fillStyle = "#0f1724";
    ctx.beginPath();
    ctx.ellipse(0,0,rad,rad*0.9, 0, 0, Math.PI*2);
    ctx.fill();

    // degradado metálico
    const cg = ctx.createRadialGradient(-rad*0.3, -rad*0.3, 10, 0,0, rad);
    cg.addColorStop(0,"#ffffff20");
    cg.addColorStop(0.5,"#888");
    cg.addColorStop(1,"#00000080");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0,0,rad*0.85,0,Math.PI*2);
    ctx.fill();

    // esfera
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.arc(0,0,radius,0,Math.PI*2);
    ctx.fill();

    // marcas horas
    ctx.strokeStyle = "#e6e6e6";
    ctx.lineWidth = 2;
    for(let i=0;i<12;i++){
      const ang = i * Math.PI/6 + rotation * Math.PI/180 * 0.04;
      const x1 = Math.cos(ang)*(radius*0.75), y1 = Math.sin(ang)*(radius*0.75);
      const x2 = Math.cos(ang)*(radius*0.9), y2 = Math.sin(ang)*(radius*0.9);
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
    }

    // manecillas (hora/min)
    const now = new Date();
    const seconds = (now.getSeconds() + now.getMilliseconds()/1000);
    const minutes = now.getMinutes() + seconds/60;
    const hours = (now.getHours()%12) + minutes/60;

    // hora
    ctx.strokeStyle = "#c59b6a";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    const angH = (hours/12)*Math.PI*2 + rotation * Math.PI/180 * 0.01;
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(angH)*radius*0.5, Math.sin(angH)*radius*0.5);
    ctx.stroke();

    // minuto
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    const angM = (minutes/60)*Math.PI*2 + rotation * Math.PI/180 * 0.01;
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(angM)*radius*0.75, Math.sin(angM)*radius*0.75);
    ctx.stroke();

    // segundero
    ctx.strokeStyle = "#ff5c5c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const angS = (seconds/60)*Math.PI*2 + rotation * Math.PI/180 * 0.01;
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(angS)*radius*0.85, Math.sin(angS)*radius*0.85);
    ctx.stroke();

    // centro
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(0,0,6,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  loop();
}

/* -------------------------
  Contacto
---------------------------*/
function setupContacto(){
  document.getElementById("form-contacto").addEventListener("submit", e => {
    e.preventDefault();
    alert("Gracias por tu mensaje. Te contactaremos pronto.");
    e.target.reset();
  });
}

/* -------------------------
  Generar certificado (abre ventana imprimible)
---------------------------*/
function generateCertificate(){
  const session = readLS(LS_SESSION);
  if(!session){ alert("Inicia sesión para generar tu certificado"); return; }
  // ejemplo simple de certificado que el usuario puede imprimir
  const html = `
    <html><head><title>Certificado de Autenticidad</title>
      <style>
        body{font-family:Arial;color:#111;padding:40px}
        .card{border:2px solid #000;padding:24px;border-radius:12px;width:700px}
        h1{margin-top:0}
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Certificado de Autenticidad</h1>
        <p>Este certificado confirma que la pieza adquirida en <strong>Tienda de Relojes de Lujo</strong> es auténtica.</p>
        <p>Usuario: <strong>${session.usuario}</strong></p>
        <p>Fecha: <strong>${new Date().toLocaleString()}</strong></p>
        <p>Firma: __________________________</p>
      </div>
      <script>window.print()</script>
    </body></html>
  `;
  const w = window.open("", "_blank", "width=800,height=700");
  w.document.write(html);
  w.document.close();
}

/* -------------------------
  Misc helpers
---------------------------*/
(function enableKeyboardShortcuts(){
  // tecla C abre carrito
  window.addEventListener("keydown", e => {
    if(e.key.toLowerCase() === "c" && (e.ctrlKey || e.metaKey) === false){
      document.getElementById("btn-carrito").click();
    }
  });
})();

