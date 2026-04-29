"use client";

import { useEffect, useMemo, useState } from "react";

const fallbackImg =
  "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1200&auto=format&fit=crop";

function normalizeTelegram(v) {
  if (!v) return "#";
  const t = v.trim();
  if (t.startsWith("http")) return t;
  if (t.startsWith("@")) return "https://t.me/" + t.slice(1);
  return "https://t.me/" + t;
}

export default function Home() {
  const [data, setData] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("online");
  const [editingWorkId, setEditingWorkId] = useState("");

  const d = data || {};
  const telegram = normalizeTelegram(d.telegram);

  async function refresh() {
    const res = await fetch("/api/site", { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const glow = document.getElementById("glow");
    const handler = (e) => {
      if (!glow) return;
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  function loginAdmin() {
    if (password !== "Nodirbek2003") {
      alert("Parol noto‘g‘ri!");
      return;
    }
    setLoginOpen(false);
    setAdminOpen(true);
    setTimeout(fillAdmin, 0);
  }

  function fillAdmin() {
    const current = data || {};
    const ids = [
      "firstName",
      "lastName",
      "badge",
      "subtitle",
      "description",
      "telegram",
      "stat1",
      "stat1Text",
      "stat2",
      "stat2Text",
      "stat3",
      "stat3Text",
      "stat4",
      "stat4Text",
      "contactTitle",
      "contactText",
    ];
    ids.forEach((id) => {
      const el = document.getElementById("a_" + id);
      if (el) el.value = current[id] || "";
    });
  }

  async function api(url, options = {}) {
    setStatus("saqlanyapti...");
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "x-admin-password": password,
      },
    });

    const json = await res.json();
    if (!res.ok) {
      setStatus("xatolik");
      alert(json.error || "Xatolik");
      return null;
    }
    setData(json);
    setStatus("saqlandi");
    return json;
  }

  async function saveMainData() {
    const form = new FormData();
    [
      "firstName",
      "lastName",
      "badge",
      "subtitle",
      "description",
      "telegram",
      "stat1",
      "stat1Text",
      "stat2",
      "stat2Text",
      "stat3",
      "stat3Text",
      "stat4",
      "stat4Text",
      "contactTitle",
      "contactText",
    ].forEach((key) => form.append(key, document.getElementById("a_" + key).value));

    const profile = document.getElementById("profileFile").files[0];
    if (profile) form.append("profileFile", profile);

    await api("/api/site", { method: "PUT", body: form });
    alert("Saqladi!");
  }

  async function addService() {
    const title = document.getElementById("serviceTitle").value.trim();
    const text = document.getElementById("serviceText").value.trim();
    if (!title || !text) return alert("Xizmat nomi va izohini yozing.");

    await api("/api/services", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, text }),
    });

    document.getElementById("serviceTitle").value = "";
    document.getElementById("serviceText").value = "";
  }

  async function deleteService(index) {
    await api(`/api/services?index=${index}`, { method: "DELETE" });
  }

  function editWork(work) {
    setEditingWorkId(work.id);
    document.getElementById("workTitle").value = work.title || "";
    document.getElementById("workText").value = work.text || "";
    document.getElementById("workImage").value = "";
    document.getElementById("workPdf").value = "";
    document.getElementById("workFormTitle").textContent = "Loyihani update qilish";
  }

  function cancelWorkEdit() {
    setEditingWorkId("");
    document.getElementById("workTitle").value = "";
    document.getElementById("workText").value = "";
    document.getElementById("workImage").value = "";
    document.getElementById("workPdf").value = "";
    document.getElementById("workFormTitle").textContent = "Qilgan ishlarimga loyiha qo‘shish";
  }

  async function saveWork() {
    const title = document.getElementById("workTitle").value.trim();
    const text = document.getElementById("workText").value.trim();
    const imageFile = document.getElementById("workImage").files[0];
    const pdfFile = document.getElementById("workPdf").files[0];

    if (!title || !text) return alert("Loyiha nomi va izohini yozing.");
    if (!editingWorkId && !imageFile) return alert("Yangi loyiha uchun rasm yuklang.");

    const form = new FormData();
    form.append("title", title);
    form.append("text", text);
    if (imageFile) form.append("imageFile", imageFile);
    if (pdfFile) form.append("pdfFile", pdfFile);

    if (editingWorkId) {
      await api(`/api/works/${editingWorkId}`, { method: "PUT", body: form });
    } else {
      await api("/api/works", { method: "POST", body: form });
    }
    cancelWorkEdit();
  }

  async function deleteWork(work) {
    if (!confirm("Shu loyihani o‘chirasizmi? Fayllar Vercel Blob’dan ham o‘chadi.")) return;
    await api(`/api/works/${work.id}`, { method: "DELETE" });
  }

  async function clearWorks() {
    if (!confirm("Hamma portfolio o‘chsinmi? Blob fayllar ham o‘chadi.")) return;
    await api("/api/works", { method: "DELETE" });
  }

  async function moveWork(id, direction) {
    await api("/api/works/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, direction }),
    });
  }

  if (!data) {
    return <div style={{ padding: 40 }}>Yuklanmoqda...</div>;
  }

  return (
    <>
      <div className="bg-video">
        <video autoPlay muted loop playsInline>
          <source src="https://cdn.coverr.co/videos/coverr-working-on-a-laptop-1567/1080p.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="overlay"></div>
      <div className="cursor-glow" id="glow"></div>

      <nav>
        <div className="logo">{d.firstName}.</div>
        <div className="links">
          <a href="#home">Bosh sahifa</a>
          <a href="#services">Xizmatlar</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#price">Paketlar</a>
          <a href="#contact">Aloqa</a>
          <button onClick={() => setLoginOpen(true)}>Admin</button>
        </div>
        <button onClick={() => setLoginOpen(true)}>Admin</button>
      </nav>

      <section className="hero" id="home">
        <div>
          <div className="badge">{d.badge}</div>
          <h1>
            <span>{d.firstName}</span> <span>{d.lastName}</span>
          </h1>
          <h2>{d.subtitle}</h2>
          <p>{d.description}</p>
          <div className="buttons">
            <a href="#portfolio" className="btn btn-main">Portfolio ko‘rish</a>
            <a href={telegram} target="_blank" className="btn btn-outline">Telegram orqali yozish</a>
          </div>
        </div>
        <div className="profile-box">
          <div className="profile-card">
            <img className="profile-img" src={d.profile || fallbackImg} alt="Nodirbek Yunosov" />
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat"><h3>{d.stat1}</h3><p>{d.stat1Text}</p></div>
        <div className="stat"><h3>{d.stat2}</h3><p>{d.stat2Text}</p></div>
        <div className="stat"><h3>{d.stat3}</h3><p>{d.stat3Text}</p></div>
        <div className="stat"><h3>{d.stat4}</h3><p>{d.stat4Text}</p></div>
      </section>

      <section id="services">
        <div className="title"><span>Mutaxassisliklarim</span><h2>Xizmatlar</h2></div>
        <div className="services-grid">
          {d.services?.map((s, i) => (
            <div className="service" key={s.id || i}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {adminOpen && <button className="mini-btn danger" onClick={() => deleteService(i)}>O‘chirish</button>}
            </div>
          ))}
        </div>
      </section>

      <section id="portfolio">
        <div className="title"><span>Real ishlar</span><h2>Qilgan ishlarim</h2></div>
        <div className="portfolio-grid">
          {d.works?.map((w) => (
            <div className="work" key={w.id}>
              <img src={w.image || fallbackImg} alt={w.title} onError={(e) => (e.currentTarget.src = fallbackImg)} />
              <div className="work-content">
                <h3>{w.title}</h3>
                <p>{w.text}</p>
                <div className="work-actions">
                  {w.pdf && <a className="mini-btn" href={w.pdf} target="_blank">PDF ko‘rish</a>}
                  {adminOpen && <>
                    <button className="mini-btn" onClick={() => editWork(w)}>Update</button>
                    <button className="mini-btn" onClick={() => moveWork(w.id, "up")}>↑</button>
                    <button className="mini-btn" onClick={() => moveWork(w.id, "down")}>↓</button>
                    <button className="mini-btn danger" onClick={() => deleteWork(w)}>O‘chirish</button>
                  </>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="price">
        <div className="title"><span>Mijoz olib keladigan paketlar</span><h2>Xizmat paketlari</h2></div>
        <div className="pricing">
          <div className="price"><h3>Starter</h3><p>Yangi boshlayotgan bizneslar uchun.</p><ul><li>5 ta SMM post</li><li>1 ta banner</li><li>2 marta tuzatish</li></ul><a href={telegram} target="_blank" className="btn btn-outline">Buyurtma berish</a></div>
          <div className="price"><h3>Business</h3><p>Faol reklama qilayotgan bizneslar uchun.</p><ul><li>10 ta SMM post</li><li>Logo yoki banner</li><li>Reklama dizaynlari</li></ul><a href={telegram} target="_blank" className="btn btn-main">Buyurtma berish</a></div>
          <div className="price"><h3>Premium</h3><p>To‘liq brend ko‘rinishi kerak bo‘lganlar uchun.</p><ul><li>Logo dizayn</li><li>Brending</li><li>SMM dizaynlar</li><li>Packaging / Web UI</li></ul><a href={telegram} target="_blank" className="btn btn-outline">Buyurtma berish</a></div>
        </div>
      </section>

      <section>
        <div className="title"><span>Ishonch</span><h2>Mijozlar fikri</h2></div>
        <div className="testimonials">
          <div className="testimonial">“Dizaynlar juda sifatli va professional chiqdi. Ish tez va aniq bajarildi.”</div>
          <div className="testimonial">“Brendimiz uchun premium ko‘rinish yaratib berdi. Natijadan mamnunmiz.”</div>
          <div className="testimonial">“SMM postlarimiz oldingidan ancha kuchli ko‘rina boshladi.”</div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="contact-box">
          <h2>{d.contactTitle}</h2>
          <p>{d.contactText}</p>
          <a href={telegram} target="_blank" className="btn btn-main">Telegramga yozish</a>
        </div>
      </section>

      <footer>© 2026 {d.firstName} {d.lastName}. Barcha huquqlar himoyalangan.</footer>

      <div className={`admin-modal ${loginOpen ? "show" : ""}`}>
        <div className="login-box">
          <h2 style={{ color: "#00ffd5", marginBottom: 10 }}>Admin panel</h2>
          <p className="small-note">Admin panelga kirish uchun parolni kiriting.</p>
          <label>Parol</label>
          <input type="password" placeholder="Admin parol" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="admin-buttons">
            <button className="btn btn-main" onClick={loginAdmin}>Kirish</button>
            <button className="btn btn-outline" onClick={() => setLoginOpen(false)}>Yopish</button>
          </div>
        </div>
      </div>

      <div className={`admin-modal ${adminOpen ? "show" : ""}`}>
        <div className="admin-panel">
          <div className="admin-head">
            <h2>Admin panel — Vercel Storage <span className="sync-status">{status}</span></h2>
            <button className="btn btn-outline" onClick={() => setAdminOpen(false)}>Yopish</button>
          </div>

          <div className="admin-grid">
            <div className="admin-card">
              <h3>Asosiy ma’lumotlar</h3>
              {["firstName","lastName","badge","subtitle","description","telegram"].map((key) => (
                <div key={key}>
                  <label>{key}</label>
                  {key === "description" ? <textarea id={"a_"+key} /> : <input id={"a_"+key} />}
                </div>
              ))}
              <label>Profil rasmi yuklash/almashtirish</label>
              <input type="file" id="profileFile" accept="image/*" />
            </div>

            <div className="admin-card">
              <h3>Statistika va aloqa</h3>
              {["stat1","stat1Text","stat2","stat2Text","stat3","stat3Text","stat4","stat4Text","contactTitle","contactText"].map((key) => (
                <div key={key}>
                  <label>{key}</label>
                  {key === "contactText" ? <textarea id={"a_"+key} /> : <input id={"a_"+key} />}
                </div>
              ))}
            </div>

            <div className="admin-card">
              <h3>Xizmat qo‘shish</h3>
              <label>Xizmat nomi</label><input id="serviceTitle" />
              <label>Xizmat izohi</label><textarea id="serviceText" />
              <div className="admin-buttons"><button className="btn btn-main" onClick={addService}>Xizmat qo‘shish</button></div>
            </div>

            <div className="admin-card">
              <h3 id="workFormTitle">Qilgan ishlarimga loyiha qo‘shish</h3>
              <label>Loyiha nomi</label><input id="workTitle" />
              <label>Loyiha izohi</label><textarea id="workText" />
              <label>Rasm yuklash/almashtirish</label><input type="file" id="workImage" accept="image/*" />
              <label>PDF yuklash/almashtirish</label><input type="file" id="workPdf" accept="application/pdf" />
              <div className="admin-buttons">
                <button className="btn btn-main" onClick={saveWork}>Saqlash</button>
                <button className="btn btn-outline" onClick={cancelWorkEdit}>Bekor qilish</button>
                <button className="btn danger" onClick={clearWorks}>Portfolio tozalash</button>
              </div>
              <p className="small-note">Fayllar Vercel Blob’da, ma’lumotlar Vercel KV’da saqlanadi.</p>
            </div>
          </div>

          <div className="admin-card" style={{ marginTop: 18 }}>
            <h3>Portfolio boshqaruvi</h3>
            <div className="admin-work-list">
              {d.works?.map((w) => (
                <div className="admin-work-item" key={w.id}>
                  <img src={w.image || fallbackImg} alt={w.title} />
                  <div>
                    <h4>{w.title}</h4>
                    <p>{w.text}</p>
                    <div className="admin-work-actions">
                      <button className="mini-btn" onClick={() => editWork(w)}>Update</button>
                      <button className="mini-btn" onClick={() => moveWork(w.id, "up")}>↑</button>
                      <button className="mini-btn" onClick={() => moveWork(w.id, "down")}>↓</button>
                      {w.pdf && <a className="mini-btn" href={w.pdf} target="_blank">PDF</a>}
                      <button className="mini-btn danger" onClick={() => deleteWork(w)}>O‘chirish</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-buttons">
            <button className="btn btn-main" onClick={saveMainData}>Barcha ma’lumotlarni saqlash</button>
          </div>
        </div>
      </div>
    </>
  );
}
