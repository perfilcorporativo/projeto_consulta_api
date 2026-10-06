const form = document.querySelector("#cep-form");
const input = document.querySelector("#cep");
const message = document.querySelector("#message");
const result = document.querySelector("#result");
const history = document.querySelector("#history");
const refresh = document.querySelector("#refresh");

async function api(path) {
  const response = await fetch(path);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Falha na consulta.");
  return body;
}

function renderAddress(address) {
  result.classList.remove("hidden");
  result.innerHTML = `
    <div class="result-top">
      <strong>${address.cep}</strong>
      <span class="badge">${address.cache ? "cache local" : "ViaCEP"}</span>
    </div>
    <h3>${address.logradouro || "Logradouro não informado"}</h3>
    <p>${address.bairro || "Bairro não informado"}</p>
    <p>${address.cidade} — ${address.estado}</p>
  `;
}

async function loadHistory() {
  try {
    const items = await api("/api/history");
    if (!items.length) {
      history.innerHTML = '<p class="empty">Nenhuma consulta registrada ainda.</p>';
      return;
    }

    history.innerHTML = items.map(item => `
      <article class="history-item" data-cep="${item.cep}">
        <div>
          <strong>${item.cep}</strong>
          <p>${item.cidade} — ${item.estado}</p>
        </div>
        <span>${item.logradouro || "Endereço consultado"}</span>
      </article>
    `).join("");

    history.querySelectorAll(".history-item").forEach(item => {
      item.addEventListener("click", () => {
        input.value = item.dataset.cep;
        form.requestSubmit();
      });
    });
  } catch (error) {
    history.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "Consultando...";
  result.classList.add("hidden");

  try {
    const address = await api(`/api/cep/${encodeURIComponent(input.value)}`);
    renderAddress(address);
    message.textContent = address.cache
      ? "Resultado carregado do cache local."
      : "Resultado consultado no ViaCEP e salvo no histórico.";
    await loadHistory();
  } catch (error) {
    message.textContent = error.message;
  }
});

refresh.addEventListener("click", loadHistory);
loadHistory();
