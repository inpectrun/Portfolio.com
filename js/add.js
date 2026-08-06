// Create the observer
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const skill = entry.target;
      const percent = skill.getAttribute('data-percent');
      skill.style.width = percent;

      // Stop observing this skill after it animates
      observer.unobserve(skill);
    }
  });
}, {
  threshold: 0.5 // Trigger when 50% of the element is visible
});

// Observe each skill-fill element
document.querySelectorAll('.skill-fill').forEach(skill => {
  observer.observe(skill);
});


// Animated particle background for the intro/hero section
(function () {
  const canvas = document.getElementById('intro-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const intro = canvas.parentElement;
  let particles = [];

  function resize() {
    canvas.width = intro.offsetWidth;
    canvas.height = intro.offsetHeight;
  }

  function createParticles() {
    const count = Math.floor((canvas.width * canvas.height) / 22000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 1.5
    }));
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
    });

    const maxDist = 260;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  resize();
  createParticles();
  requestAnimationFrame(step);

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  intro.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = 0; i < 6; i++) {
      particles.push({
        x: clickX,
        y: clickY,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: Math.random() * 2.5 + 1.5
      });
    }
  });
})();


// Draggable ID card on a lanyard, snaps back like a rubber band
(function () {
  const card = document.getElementById('idCard');
  const clip = document.getElementById('idClip');
  const svg = document.getElementById('idStrapSvg');
  const line = document.getElementById('idStrapLine');
  const twist = document.getElementById('idStrapTwist');
  const ring = document.getElementById('idStrapRing');
  if (!card || !clip || !svg || !line || !ring) return;

  const returnEase = 0.05;

  let dx = 0, dy = 0;
  let dragging = false;
  let startX = 0, startY = 0;
  let springRunning = false;

  function render() {
    const angleDeg = Math.atan2(dx, 340 + dy) * 180 / Math.PI;
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${angleDeg * 0.5}deg)`;

    // Draw the strap as a rope between the real, current pixel positions of
    // the clip and the card, so they can never visually separate. The more
    // the card is dragged from rest, the more the rope loosens and sags.
    const svgRect = svg.getBoundingClientRect();
    const clipRect = clip.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const x1 = clipRect.left + clipRect.width / 2 - svgRect.left;
    const y1 = clipRect.bottom - svgRect.top;
    const x2 = cardRect.left + cardRect.width / 2 - svgRect.left;
    const y2 = cardRect.top - svgRect.top;

    const dragDist = Math.sqrt(dx * dx + dy * dy);
    const sag = 20 + Math.min(dragDist * 0.3, 150);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 + sag;

    const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    line.setAttribute('d', pathD);
    if (twist) twist.setAttribute('d', pathD);

    ring.setAttribute('cx', x2);
    ring.setAttribute('cy', y2);
  }

  function frame() {
    if (springRunning) {
      dx += (0 - dx) * returnEase;
      dy += (0 - dy) * returnEase;
      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        dx = 0; dy = 0;
        springRunning = false;
      }
    }
    render();
    requestAnimationFrame(frame);
  }

  card.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    dragging = true;
    springRunning = false;
    card.classList.add('dragging');
    card.setPointerCapture(e.pointerId);
    startX = e.clientX - dx;
    startY = e.clientY - dy;
  });

  card.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;
  });

  function releaseDrag(e) {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    springRunning = true;
  }

  card.addEventListener('pointerup', releaseDrag);
  card.addEventListener('pointercancel', releaseDrag);

  card.addEventListener('click', (e) => e.stopPropagation());

  requestAnimationFrame(frame);
})();


// Center the lanyard between the "About" and "Resume" nav links
(function () {
  const lanyard = document.getElementById('idLanyard');
  const intro = document.getElementById('intro');
  const skillsLink = document.getElementById('skillsBtn');
  if (!lanyard || !intro || !skillsLink) return;

  function positionLanyard() {
    const introRect = intro.getBoundingClientRect();
    const skillsRect = skillsLink.getBoundingClientRect();
    const midX = (skillsRect.left + skillsRect.right) / 2;

    lanyard.style.left = (midX - introRect.left) + 'px';
  }

  positionLanyard();
  window.addEventListener('resize', positionLanyard);
})();





