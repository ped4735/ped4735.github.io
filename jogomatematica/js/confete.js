const COREES = ['#667eea', '#764ba2', '#27ae60', '#e67e22', '#e74c3c', '#f1c40f', '#1abc9c'];

export function dispararConfete() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const particulas = [];
  for (let i = 0; i < 80; i++) {
    particulas.push({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -12 - 4,
      g: 0.3,
      size: Math.random() * 8 + 4,
      cor: COREES[Math.floor(Math.random() * COREES.length)],
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10,
    });
  }

  let frames = 0;
  const maxFrames = 120;

  function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas.forEach(p => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    frames++;
    if (frames < maxFrames) {
      requestAnimationFrame(animar);
    } else {
      canvas.remove();
    }
  }
  animar();
}
