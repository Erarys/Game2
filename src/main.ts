import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
} from "pixi.js";

import { hitWall } from "./wallAnimate";
import { createExplosion } from "./tankFiire";

const app = new Application();

await app.init({
  width: window.innerWidth - 1,
  height: window.innerHeight - 4,
});

document.body.appendChild(app.canvas);

// -------------------------
// Игровые слои
// -------------------------

const world = new Container();
const backgroundLayer = new Container();
const objectLayer = new Container();
const effectLayer = new Container();

world.addChild(
  backgroundLayer,
  objectLayer,
  effectLayer,
);

app.stage.addChild(world);

// -------------------------
// Карта
// -------------------------

const mapTexture = await Assets.load("/maps/map.jpg");
const mapSprite = new Sprite(mapTexture);

mapSprite.position.set(0, 0);
mapSprite.width = window.innerWidth;
mapSprite.height = window.innerHeight;

backgroundLayer.addChild(mapSprite);

// -------------------------
// Точка положения танка
// -------------------------

const tank = new Graphics();

tank.position.set(0, 0);

// Пока tank является только точкой координат.
// Картинка танка всё ещё находится в index.html.
objectLayer.addChild(tank);

// -------------------------
// Стены
// -------------------------

const walls: Graphics[] = [];

function createWall(x: number, y: number): Graphics {
  const wall = new Graphics()
    .rect(0, 0, 50, 300)
    .fill("lightblue");

  wall.position.set(x, y);
  wall.eventMode = "static";
  wall.cursor = "pointer";

  // Нажимаем на стену — танк стреляет
  wall.on("pointerdown", () => {
    fire();
  });

  objectLayer.addChild(wall);

  return wall;
}

for (let i = 0; i < 9; i++) {
  const wall = createWall(
    700 + i * 400,
    180,
  );

  walls.push(wall);
}

// -------------------------
// Пуля
// -------------------------

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

  // Пуля находится внутри игрового мира
  effectLayer.addChild(bullet);

  const speed = 3900;

  function destroyBullet(): void {
    app.ticker.remove(moveBullet);

    if (!bullet.destroyed) {
      bullet.destroy();
    }
  }

  function moveBullet(): void {
    const deltaSeconds =
      app.ticker.deltaMS / 1000;

    const previousX = bullet.x;
    const nextX =
      bullet.x + speed * deltaSeconds;

    for (const wall of walls) {
      if (wall.destroyed) continue;

      const wallLeft = wall.x;
      const wallRight =
        wall.x + wall.width;

      const wallTop = wall.y;
      const wallBottom =
        wall.y + wall.height;

      const crossesWallHorizontally =
        nextX + bulletRadius >= wallLeft &&
        previousX - bulletRadius <= wallRight;

      const crossesWallVertically =
        bullet.y + bulletRadius >= wallTop &&
        bullet.y - bulletRadius <= wallBottom;

      if (
        crossesWallHorizontally &&
        crossesWallVertically
      ) {
        bullet.x =
          wallLeft - bulletRadius;

        // Взрыв в месте попадания
        createExplosion(
          app,
          effectLayer,
          bullet.x,
          bullet.y,
        );

        hitWall(wall);
        destroyBullet();

        return;
      }
    }

    bullet.x = nextX;

    if (bullet.x > 3050) {
      destroyBullet();
    }
  }

  app.ticker.add(moveBullet);
}

// -------------------------
// Выстрел
// -------------------------

function fire(): void {
  const startX = tank.x + 550;
  const startY = tank.y + 290;

  // Вспышка возле дула
  createExplosion(
    app,
    effectLayer,
    startX,
    startY,
  );

  shootBullet(startX, startY);
}
