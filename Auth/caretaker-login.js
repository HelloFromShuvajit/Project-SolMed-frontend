document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("msg");
  msg.className = "msg";
  msg.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    localStorage.setItem("User", JSON.stringify(data));
    const decoded = typeof getUserFromToken === "function" ? getUserFromToken() : null;
    if (decoded && decoded.role === "CARETAKER") {
      window.location.href = "../CaretakerDashboard/CaretakerDashboard.html";
      return;
    }
    msg.className = "msg err";
    msg.textContent = "This account is not a caretaker. Use patient login.";
  } catch (err) {
    msg.className = "msg err";
    msg.textContent = err.message || "Login failed";
  }
});
