// ajuda.js — localizador de CAPS/UBS a partir de um endereço digitado.
//
// 1) Geocodifica o endereço com Nominatim (OpenStreetMap), gratuito e sem chave.
// 2) Calcula a distância (fórmula de Haversine) até uma lista de unidades de exemplo.
// 3) Mostra as mais próximas com link "Como chegar" (Google Maps, sem precisar de API key).
//
// IMPORTANTE: MOCK_UNITS abaixo é uma lista de EXEMPLO para o protótipo funcionar.
// Para produção, troque por uma base real (ex: CNES/DataSUS) — ver README.md.

const MOCK_UNITS = [
  { name: "CAPS Itapeva", type: "CAPS", city: "São Paulo - SP", lat: -23.5623, lng: -46.6544, phone: "(11) 3151-9770" },
  { name: "UBS Jardim Paulista", type: "UBS", city: "São Paulo - SP", lat: -23.5670, lng: -46.6610, phone: "(11) 3062-2200" },
  { name: "CAPS AD Sé", type: "CAPS", city: "São Paulo - SP", lat: -23.5505, lng: -46.6333, phone: "(11) 3311-5000" },
  { name: "UBS Vila Mariana", type: "UBS", city: "São Paulo - SP", lat: -23.5890, lng: -46.6350, phone: "(11) 5573-2000" },
  { name: "CAPS Rio Comprido", type: "CAPS", city: "Rio de Janeiro - RJ", lat: -22.9190, lng: -43.2100, phone: "(21) 2273-2273" },
  { name: "UBS Copacabana", type: "UBS", city: "Rio de Janeiro - RJ", lat: -22.9711, lng: -43.1822, phone: "(21) 2547-4463" },
  { name: "CAPS Savassi", type: "CAPS", city: "Belo Horizonte - MG", lat: -19.9386, lng: -43.9378, phone: "(31) 3277-9500" },
  { name: "UBS Centro", type: "UBS", city: "Belo Horizonte - MG", lat: -19.9245, lng: -43.9352, phone: "(31) 3277-4000" },
  { name: "CAPS Boa Vista", type: "CAPS", city: "Curitiba - PR", lat: -25.4050, lng: -49.2600, phone: "(41) 3350-9400" },
  { name: "UBS Batel", type: "UBS", city: "Curitiba - PR", lat: -25.4390, lng: -49.2890, phone: "(41) 3350-9600" },
  { name: "CAPS Boa Viagem", type: "CAPS", city: "Recife - PE", lat: -8.1210, lng: -34.9010, phone: "(81) 3355-8000" },
  { name: "UBS Casa Amarela", type: "UBS", city: "Recife - PE", lat: -8.0300, lng: -34.9280, phone: "(81) 3355-7800" },
  { name: "CAPS Centro", type: "CAPS", city: "Porto Alegre - RS", lat: -30.0330, lng: -51.2300, phone: "(51) 3289-2900" },
  { name: "UBS Cidade Baixa", type: "UBS", city: "Porto Alegre - RS", lat: -30.0430, lng: -51.2260, phone: "(51) 3289-2000" },
  { name: "CAPS Barra", type: "CAPS", city: "Salvador - BA", lat: -13.0100, lng: -38.5300, phone: "(71) 3202-8000" },
  { name: "UBS Pituba", type: "UBS", city: "Salvador - BA", lat: -12.9950, lng: -38.4550, phone: "(71) 3202-7900" },
];

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "pt-BR" },
  });
  if (!res.ok) throw new Error("Falha ao consultar o serviço de geocodificação.");
  const data = await res.json();
  if (!data.length) throw new Error("Endereço não encontrado. Tente incluir cidade e estado.");
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
}

function renderResults(origin, units) {
  const list = document.getElementById("results-list");
  list.innerHTML = "";

  const withDistance = units
    .map((u) => ({ ...u, distance: haversineDistanceKm(origin.lat, origin.lng, u.lat, u.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  withDistance.forEach((u) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${u.lat},${u.lng}`;
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <div>
        <span class="result-tag ${u.type === 'UBS' ? 'ubs' : ''}">${u.type}</span>
        <div style="font-weight:700;">${u.name}</div>
        <div style="font-size:0.85rem;color:#6B5A48;">${u.city} · ${u.phone}</div>
      </div>
      <div style="text-align:right;">
        <div class="result-dist">${u.distance.toFixed(1)} km</div>
        <a href="${mapsUrl}" target="_blank" rel="noopener" style="font-size:0.85rem;font-weight:700;">Como chegar →</a>
      </div>`;
    list.appendChild(card);
  });
}

document.getElementById("search-btn").addEventListener("click", async () => {
  const input = document.getElementById("address-input");
  const status = document.getElementById("status-msg");
  const address = input.value.trim();

  if (!address) {
    status.textContent = "Digite um endereço, bairro ou cidade para buscar.";
    status.className = "status-msg error";
    return;
  }

  status.textContent = "Buscando unidades próximas...";
  status.className = "status-msg";
  document.getElementById("results-list").innerHTML = "";

  try {
    const origin = await geocodeAddress(address);
    renderResults(origin, MOCK_UNITS);
    status.textContent = `Mostrando unidades mais próximas de: ${origin.displayName}`;
  } catch (err) {
    status.textContent = err.message || "Não foi possível localizar esse endereço.";
    status.className = "status-msg error";
  }
});

document.getElementById("address-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("search-btn").click();
});
