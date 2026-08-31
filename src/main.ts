import { Application, Graphics } from "pixi.js";
import { hitWall } from "./wallAnimate";
import { createExplosion } from "./tankFiire";

const app = new Application();

await app.init({
  width: 3000,
  height: 600,
  background: "grey",
});

function shootBullet(
  startX: number,
  startY: number,
): void {
  const bulletRadius = 6;

  const bullet = new Graphics()
    .circle(0, 0, 12)
    .fill({
      color: 0xff6600,
      alpha: 0.25,
    })
    .circle(0, 0, bulletRadius)
    .fill(0xffffaa);

  bullet.position.set(startX, startY);
  app.stage.addChild(bullet);

  const speed = 3900;

  function destroyBullet(): void {
    app.ticker.remove(moveBullet);

    if (!bullet.destroyed) {
      bullet.destroy();
    }
  }

  function moveBullet(): void {
    const deltaSeconds = app.ticker.deltaMS / 1000;

    const previousX = bullet.x;
    const nextX = bullet.x + speed * deltaSeconds;

    for (const wall of walls) {
      if (wall.destroyed) continue;

      const wallLeft = wall.x;
      const wallRight = wall.x + wall.width;
      const wallTop = wall.y;
      const wallBottom = wall.y + wall.height;

      // Проверяем пересечение пути пули со стеной
      const crossesWallHorizontally =
        nextX + bulletRadius >= wallLeft &&
        previousX - bulletRadius <= wallRight;

      const crossesWallVertically =
        bullet.y + bulletRadius >= wallTop &&
        bullet.y - bulletRadius <= wallBottom;

      if (crossesWallHorizontally && crossesWallVertically) {
        // Перемещаем пулю к точке попадания
        bullet.x = wallLeft - bulletRadius;

        createExplosion(
          app,
          app.stage,
          bullet.x,
          bullet.y,
        );

        hitWall(wall);
        destroyBullet();

        return;
      }
    }

    bullet.x = nextX;

    if (bullet.x > app.screen.width + 50) {
      destroyBullet();
    }
  }

  app.ticker.add(moveBullet);
}

function fire(): void {
  const startX = tank.x + 550;
  const startY  = tank.y + 290;


  shootBullet(startX, startY);
}



document.body.appendChild(app.canvas);
const tank = new Graphics ()

function createWall(x: number, y: number): Graphics {
  const wall = new Graphics()
      .rect(0, 0, 50, 300)
      .fill("lightblue");

  wall.x = x;
  wall.y = y;
  wall.eventMode = "static";
  wall.cursor = "pointer";

  wall.on("pointerdown", () => {
    const explosionX = tank.x + 550;
    const explosionY = tank.y + 290;
    fire();
    createExplosion(
      app,
      app.stage,
      explosionX,
      explosionY,
    );
  });

  app.stage.addChild(wall);

  return wall;
}
const walls: Graphics[] = [];

for (let i = 0; i < 9; i++){
  const wall = createWall(700 + i * 400, 180);
  walls.push(wall)
}

