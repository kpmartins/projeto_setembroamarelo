// common.js — elementos compartilhados entre as 3 páginas:
// navbar, faixa fixa de emergência (CVV) e o SVG de girassol (elemento assinatura visual).

function sunflowerSVG(size = 48, stemHeight = 60) {
  return `
  <svg viewBox="0 0 100 160" width="${size}" height="${size * 160 / 100}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="50" y1="70" x2="50" y2="${70 + stemHeight}" stroke="#7C9A5E" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 100 C 35 100, 28 115, 20 118" stroke="#7C9A5E" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 115 C 65 115, 72 128, 80 132" stroke="#7C9A5E" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g>
      ${Array.from({length: 12}).map((_, i) => {
        const angle = i * 30;
        return `<ellipse cx="50" cy="30" rx="9" ry="20" fill="#FFC93C" transform="rotate(${angle} 50 70) translate(0 -30)"/>`;
      }).join('')}
    </g>
    <circle cx="50" cy="70" r="17" fill="#4A3728"/>
    <circle cx="50" cy="70" r="17" fill="url(#seedPattern)" opacity="0.25"/>
  </svg>`;
}

function renderNavbar(active) {
  const el = document.getElementById('navbar-root');
  if (!el) return;
  const links = [
    { href: 'index.html', label: 'Home' },
    { href: 'chats.html', label: 'Chats' },
    { href: 'ajuda.html', label: 'Ajuda' },
  ];
  el.innerHTML = `
    <nav class="navbar">
      <a href="index.html" class="navbar__brand">
        ${sunflowerSVG(28, 0)}
        Setembro Amarelo
      </a>
      <ul class="navbar__links">
        ${links.map(l => `<li><a href="${l.href}" class="${active === l.href ? 'active' : ''}">${l.label}</a></li>`).join('')}
      </ul>
    </nav>`;
}

function renderEmergencyBar() {
  const el = document.getElementById('emergency-root');
  if (!el) return;
  el.innerHTML = `
    <div class="emergency-bar">
      <span>Precisa conversar agora? <strong>CVV — Valorização da Vida</strong>, ligação gratuita, 24h, todos os dias.</span>
      <a class="cvv-link" href="tel:188">Ligar 188</a>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderEmergencyBar();
});
