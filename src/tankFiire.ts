import { Application, Container, Graphics } from "pixi.js";

type Particle = {
  view: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

export function createExplosion(
  app: Application,
  parent: Container,
  x: number,
  y: number,
): void {
  const particles: Particle[] = [];
  const colors = [0xff2400, 0xff6a00, 0xffcc00, 0xffffff];

  // Создаём частицы
  for (let i = 0; i < 70; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 150 + Math.random() * 450;
    const radius = 2 + Math.random() * 7;
    const maxLife = 400 + Math.random() * 600;

    const particle = new Graphics()
      .circle(0, 0, radius)
      .fill(colors[Math.floor(Math.random() * colors.length)]);

    particle.x = x;
    particle.y = y;

    parent.addChild(particle);

    particles.push({
      view: particle,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
    });
  }

  function update(): void {
    const deltaSeconds = app.ticker.deltaMS / 1000;

    for (const particle of particles) {
      if (particle.view.destroyed) continue;

      particle.life -= app.ticker.deltaMS;

      // Движение
      particle.view.x += particle.vx * deltaSeconds;
      particle.view.y += particle.vy * deltaSeconds;

      // Гравитация
      particle.vy += 500 * deltaSeconds;

      // Замедление
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Исчезновение и уменьшение
      const progress = Math.max(0, particle.life / particle.maxLife);

      particle.view.alpha = progress;
      particle.view.scale.set(progress);

      if (particle.life <= 0) {
        particle.view.destroy();
      }
    }

    const effectFinished = particles.every(
      (particle) => particle.view.destroyed,
    );

    if (effectFinished) {
      app.ticker.remove(update);
    }
  }

  app.ticker.add(update);
}
