document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("msg");
  msg.className = "msg";
  msg.textContent = "";
  const body = {
    patientEmail: document.getElementById("patientEmail").value.trim(),
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value.trim(),
    age: parseInt(document.getElementById("age").value, 10),
    gender: document.getElementById("gender").value.trim(),
    position: document.getElementById("position").value.trim() || "Caretaker",
    role: "CARETAKER",
  };
  try {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    if (!response.ok) {
      throw new Error(data.message || text || "Signup failed");
    }
    localStorage.setItem("User", JSON.stringify(data));
    window.location.href = "../CaretakerDashboard/CaretakerDashboard.html";
  } catch (err) {
    msg.className = "msg err";
    msg.textContent = err.message || "Signup failed";
  }
});
