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

const tankTexture = await Assets.load("/public/maps/tank.png");

const tank = new Sprite(tankTexture);

tank.width = 500;
tank.height = 300;
tank.position.set(50, 500);
// Пока tank является только точкой координат.
// Картинка танка всё ещё находится в index.html.

objectLayer.addChild(tank);

const pressedKeys = new Set<string>();

window.addEventListener("keydown", (event) => {
  pressedKeys.add(event.code);

  // Не прокручивать страницу стрелками и пробелом
  if (
    event.code === "ArrowLeft" ||
    event.code === "ArrowRight" ||
    event.code === "ArrowUp" ||
    event.code === "ArrowDown" ||
    event.code === "Space"
  ) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.code);
});


const tankSpeed = 500;

function tankMove(): void {
  const deltaSeconds =
    app.ticker.deltaMS / 1000;

  const distance =
    tankSpeed * deltaSeconds;

  // Влево: A или стрелка
  if (
    pressedKeys.has("KeyA") ||
    pressedKeys.has("ArrowLeft")
  ) {
    tank.x -= distance;
  }

  // Вправо: D или стрелка
  if (
    pressedKeys.has("KeyD") ||
    pressedKeys.has("ArrowRight")
  ) {
    tank.x += distance;
  }

  // Вверх: W или стрелка
  if (
    pressedKeys.has("KeyW") ||
    pressedKeys.has("ArrowUp")
  ) {
    tank.y -= distance;
  }

  // Вниз: S или стрелка
  if (
    pressedKeys.has("KeyS") ||
    pressedKeys.has("ArrowDown")
  ) {
    tank.y += distance;
  }

  // Ограничение по ширине карты
  tank.x = Math.max(
    0,
    Math.min(tank.x, 3000 - tank.width),
  );

  // Ограничение по высоте карты
  tank.y = Math.max(
    0,
    Math.min(
      tank.y,
      app.screen.height - tank.height,
    ),
  );
}

app.ticker.add(tankMove);
// -------------------------
// Стены
// -------------------------


const enemyTexture = await Assets.load(
  "/maps/enemy.png",
);

const enemies: Sprite[] = [];


function createEnemy(
  x: number,
  y: number,
): Sprite {
  const enemy = new Sprite(enemyTexture);

  enemy.width = 250;
  enemy.height = 150;

  enemy.position.set(x, y);

  enemy.eventMode = "static";
  enemy.cursor = "pointer";

  // Клик по противнику — выстрел
  enemy.on("pointerdown", () => {
    fire();
  });

  objectLayer.addChild(enemy);

  return enemy;
}

// Создаём несколько противников
for (let i = 0; i < 6; i++) {
  const enemy = createEnemy(
    700 + i * 400,
    400,
  );

  enemies.push(enemy);
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

  const speed = 500;

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

    for (const enemy of enemies) {
      if (enemy.destroyed) continue;

      const enemyLeft = enemy.x;
      const enemyRight =
        enemy.x + enemy.width;

      const enemyTop = enemy.y;
      const enemyBottom =
        enemy.y + enemy.height;

      const crossesEnemyHorizontally =
        nextX + bulletRadius >= enemyLeft &&
        previousX - bulletRadius <= enemyRight;

      const crossesEnemyVertically =
        bullet.y + bulletRadius >= enemyTop &&
        bullet.y - bulletRadius <= enemyBottom;

      if (
        crossesEnemyHorizontally &&
        crossesEnemyVertically
      ) {
        // Ставим пулю в точку попадания
        bullet.x =
          enemyLeft - bulletRadius;

        createExplosion(
          app,
          effectLayer,
          bullet.x,
          bullet.y,
        );

        // Уничтожаем вражеский танк
        enemy.destroy();

        // Уничтожаем пулю
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
  const startX = tank.x + tank.width;
  const startY = tank.y + tank.height * 0.3;

  createExplosion(
    app,
    effectLayer,
    startX,
    startY,
  );

  shootBullet(startX, startY);
}

