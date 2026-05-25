(function () {
  'use strict';

  const domains = [
    'Computer Vision',
    '3D Reconstruction',
    'Neural Rendering',
    'Gaussian Splatting',
    'Point Cloud',
    'Robotics Perception'
  ];

  let animationId;
  let detachSky;

  function buildHero() {
    const header = document.querySelector('#page-header.full_page');
    const siteInfo = header && header.querySelector('#site-info');
    if (!header || !siteInfo || siteInfo.querySelector('.tech-domains')) return;

    const intro = document.createElement('p');
    intro.className = 'tech-intro';
    intro.textContent = '记录计算机领域内容、科研学习和日常思考';

    const chips = document.createElement('div');
    chips.className = 'tech-domains';
    chips.setAttribute('aria-label', '研究方向');
    domains.forEach(function (name) {
      const chip = document.createElement('span');
      chip.textContent = name;
      chips.appendChild(chip);
    });

    const orbit = document.createElement('div');
    orbit.className = 'tech-orbit';
    siteInfo.appendChild(intro);
    siteInfo.appendChild(chips);
    siteInfo.appendChild(orbit);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        window.innerWidth > 768) {
      startSky(header);
    }
  }

  function startSky(header) {
    const previousCanvas = header.querySelector('.tech-sky');
    if (previousCanvas) previousCanvas.remove();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const points = [];
    const pointer = { x: -1000, y: -1000, active: false };
    canvas.className = 'tech-sky';
    header.insertBefore(canvas, header.firstChild);

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = header.clientWidth;
      const height = header.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points.length = 0;
      const count = Math.min(92, Math.max(48, Math.round(width / 18)));
      for (let i = 0; i < count; i += 1) {
        points.push({
          x: Math.random() * width,
          y: i < Math.floor(count * 0.34)
            ? height * (0.52 + Math.random() * 0.46)
            : Math.random() * height,
          dx: (Math.random() - 0.5) * 0.1,
          dy: (Math.random() - 0.5) * 0.1,
          r: Math.random() * 1.2 + 0.4
        });
      }
    }

    function draw() {
      const width = header.clientWidth;
      const height = header.clientHeight;
      context.clearRect(0, 0, width, height);
      points.forEach(function (point, index) {
        point.x += point.dx;
        point.y += point.dy;
        if (point.x < 0 || point.x > width) point.dx *= -1;
        if (point.y < 0 || point.y > height) point.dy *= -1;
        const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        const activePoint = pointer.active && pointerDistance < 155;
        context.beginPath();
        context.fillStyle = activePoint
          ? 'rgba(150, 226, 255, 0.98)'
          : 'rgba(126, 209, 255, 0.72)';
        context.arc(point.x, point.y, activePoint ? point.r * 1.65 : point.r, 0, Math.PI * 2);
        context.fill();

        for (let i = index + 1; i < points.length; i += 1) {
          const other = points[i];
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 125) {
            context.beginPath();
            const highlighted = activePoint || (pointer.active && Math.hypot(other.x - pointer.x, other.y - pointer.y) < 155);
            context.strokeStyle = 'rgba(72, 169, 236, ' + ((125 - distance) / (highlighted ? 370 : 760)) + ')';
            context.lineWidth = highlighted ? 0.9 : 0.6;
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      });
      animationId = window.requestAnimationFrame(draw);
    }

    function handlePointerMove(event) {
      const bounds = header.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
    header.addEventListener('pointermove', handlePointerMove, { passive: true });
    header.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    detachSky = function () {
      window.removeEventListener('resize', resize);
      header.removeEventListener('pointermove', handlePointerMove);
      header.removeEventListener('pointerleave', handlePointerLeave);
    };
  }

  function init() {
    if (animationId) {
      window.cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (detachSky) {
      detachSky();
      detachSky = null;
    }
    const activeHeader = document.querySelector('#page-header.full_page');
    if (activeHeader && activeHeader.querySelector('.tech-domains') &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        window.innerWidth > 768) {
      startSky(activeHeader);
      return;
    }
    buildHero();
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('pjax:complete', init);
}());
