const PASSWORD = "Omjiomjiomji03";
const TAX_RATE = 0; // Keep 0 for produce. Change to 0.14975 if you need full Quebec tax.
let category = "All";
let cart = [];

const defaultProducts = [
  ["Apple","Fruits",0,"lb"],["Banana","Fruits",0,"lb"],["Orange","Fruits",0,"lb"],["Mango","Fruits",0,"each"],["Grapes","Fruits",0,"lb"],
  ["Strawberry","Fruits",0,"box"],["Blueberry","Fruits",0,"box"],["Watermelon","Fruits",0,"each"],["Pineapple","Fruits",0,"each"],["Kiwi","Fruits",0,"each"],
  ["Lemon","Fruits",0,"each"],["Peach","Fruits",0,"lb"],["Pear","Fruits",0,"lb"],["Plum","Fruits",0,"lb"],["Avocado","Fruits",0,"each"],
  ["Tomato","Vegetables",0,"lb"],["Potato","Vegetables",0,"lb"],["Onion","Vegetables",0,"lb"],["Garlic","Vegetables",0,"each"],["Ginger","Vegetables",0,"lb"],
  ["Carrot","Vegetables",0,"lb"],["Cucumber","Vegetables",0,"each"],["Lettuce","Vegetables",0,"each"],["Spinach","Vegetables",0,"bunch"],["Broccoli","Vegetables",0,"each"],
  ["Cauliflower","Vegetables",0,"each"],["Cabbage","Vegetables",0,"each"],["Bell Pepper","Vegetables",0,"lb"],["Mushroom","Vegetables",0,"box"],["Zucchini","Vegetables",0,"lb"],
  ["Eggplant","Vegetables",0,"lb"],["Green Chili","Vegetables",0,"lb"],["Okra","Vegetables",0,"lb"],["Cilantro","Herbs",0,"bunch"],["Mint","Herbs",0,"bunch"],
  ["Parsley","Herbs",0,"bunch"],["Dill","Herbs",0,"bunch"],["Green Onion","Vegetables",0,"bunch"]
].map((p,i)=>({id:i+1,name:p[0],category:p[1],price:p[2],unit:p[3]}));

let products = JSON.parse(localStorage.getItem("products") || "null") || defaultProducts;

function money(n){ return "$" + (Number(n)||0).toFixed(2); }

function login(){
  const val = document.getElementById("password").value;
  if(val === PASSWORD){
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    renderProducts(); renderCart();
  } else document.getElementById("loginError").textContent = "Wrong password";
}

function setCategory(c){
  category=c;
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active", b.textContent===c));
  renderProducts();
}

function renderProducts(){
  const q=(document.getElementById("search")?.value||"").toLowerCase();
  const list=products.filter(p=>(category==="All"||p.category===category)&&p.name.toLowerCase().includes(q));
  document.getElementById("products").innerHTML=list.map(p=>`
    <div class="product">
      <b>${p.name}</b>
      <small>${money(p.price)} / ${p.unit}</small>
      <button onclick="addToCart(${p.id})">Add</button>
    </div>`).join("");
}

function addToCart(id){
  const p=products.find(x=>x.id===id);
  const existing=cart.find(x=>x.id===id);
  if(existing) existing.qty += 1;
  else cart.push({...p, qty:1});
  renderCart();
}

function renderCart(){
  document.getElementById("cart").innerHTML = cart.length ? cart.map((item,i)=>`
    <div class="cart-item">
      <div><b>${item.name}</b><br><small>${money(item.price)} / ${item.unit}</small></div>
      <input type="number" min="0.01" step="0.01" value="${item.qty}" onchange="updateQty(${i}, this.value)">
      <button class="x" onclick="removeItem(${i})">×</button>
    </div>`).join("") : `<p class="muted">Cart is empty.</p>`;
  const subtotal = cart.reduce((s,i)=>s + i.price*i.qty,0);
  const tax = subtotal*TAX_RATE;
  const total = subtotal+tax;
  document.getElementById("subtotal").textContent=money(subtotal);
  document.getElementById("tax").textContent=money(tax);
  document.getElementById("total").textContent=money(total);
  buildReceipt(subtotal,tax,total);
}

function updateQty(i,v){ cart[i].qty=Math.max(.01, Number(v)||.01); renderCart(); }
function removeItem(i){ cart.splice(i,1); renderCart(); }
function clearCart(){ if(confirm("Clear cart?")){ cart=[]; renderCart(); } }

function buildReceipt(subtotal,tax,total){
  document.getElementById("receiptDate").textContent=new Date().toLocaleString();
  document.getElementById("receiptItems").innerHTML=cart.map(i=>`
    <div class="ritem"><span class="rname">${i.name}<br>${i.qty} ${i.unit} x ${money(i.price)}</span><b>${money(i.qty*i.price)}</b></div>`).join("");
  document.getElementById("rSubtotal").textContent=money(subtotal);
  document.getElementById("rTax").textContent=money(tax);
  document.getElementById("rTotal").textContent=money(total);
}

function showAdmin(){
  document.getElementById("app").classList.add("hidden");
  document.getElementById("admin").classList.remove("hidden");
  renderAdmin();
}
function hideAdmin(){
  document.getElementById("admin").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  renderProducts();
}
function renderAdmin(){
  document.getElementById("adminList").innerHTML=products.map((p,i)=>`
    <div class="admin-row">
      <b>${p.name}</b>
      <input data-i="${i}" data-k="price" type="number" min="0" step="0.01" value="${p.price}">
      <input data-i="${i}" data-k="unit" value="${p.unit}">
    </div>`).join("");
}
function saveAdmin(){
  document.querySelectorAll("#adminList input").forEach(inp=>{
    const i=Number(inp.dataset.i), k=inp.dataset.k;
    products[i][k] = k==="price" ? Number(inp.value)||0 : inp.value;
  });
  localStorage.setItem("products", JSON.stringify(products));
  alert("Saved on this iPad.");
}
function exportData(){
  const blob=new Blob([JSON.stringify(products,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="fruiterie-pos-backup.json"; a.click();
}
function importData(e){
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ products=JSON.parse(r.result); localStorage.setItem("products",JSON.stringify(products)); renderAdmin(); alert("Imported."); };
  r.readAsText(f);
}
if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js"); }
