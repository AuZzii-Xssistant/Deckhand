(function () {
  var list = document.getElementById("faq-list");
  if (!list) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var items = [];
  function set(item, open, keepOthers) {
    if (open && !keepOthers) items.forEach(function (o) { if (o !== item) set(o, false, true); });
    item.classList.toggle("open", open);
    item.querySelector("button").setAttribute("aria-expanded", open ? "true" : "false");
  }
  Array.prototype.slice.call(list.querySelectorAll("details.qa")).forEach(function (d) {
    var id = d.id, q = d.querySelector("summary").textContent.trim(), body = d.querySelector(".qa-body");
    var item = document.createElement("div"); item.className = "qa-item"; item.id = id;
    var h = document.createElement("h3"); h.className = "qa-h";
    var b = document.createElement("button"); b.type = "button"; b.className = "qa-btn"; b.id = id + "-btn";
    b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", id + "-panel"); b.textContent = q;
    h.appendChild(b);
    var panel = document.createElement("div"); panel.className = "qa-panel"; panel.id = id + "-panel";
    panel.setAttribute("role", "region"); panel.setAttribute("aria-labelledby", b.id);
    var inner = document.createElement("div"); inner.appendChild(body); panel.appendChild(inner);
    item.appendChild(h); item.appendChild(panel);
    d.parentNode.replaceChild(item, d);
    items.push(item);
    b.addEventListener("click", function () { set(item, !item.classList.contains("open")); });
    b.addEventListener("keydown", function (e) {
      var i = items.indexOf(item), n = null;
      if (e.key === "ArrowDown") n = items[(i + 1) % items.length];
      else if (e.key === "ArrowUp") n = items[(i - 1 + items.length) % items.length];
      else if (e.key === "Home") n = items[0];
      else if (e.key === "End") n = items[items.length - 1];
      if (n) { e.preventDefault(); n.querySelector("button").focus(); }
    });
  });
  function fromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    var it = items.filter(function (x) { return x.id === id; })[0];
    if (it) {
      set(it, true);
      setTimeout(function () { it.scrollIntoView({ block: "center", behavior: reduce.matches ? "auto" : "smooth" }); }, 50);
    }
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();
