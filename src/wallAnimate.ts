import { Graphics, Container } from "pixi.js";

type Debris = {
  object: Graphics;
  vx: number;
  vy: number;
  rotationSpeed: number;
};

export function hitWall(wall: Graphics): void {
  const parent = wall.parent as Container;

  if (!parent) return;

  const wallX = wall.x;
  const wallY = wall.y;

  const wallWidth = wall.width;
  const wallHeight = wall.height;

  const debris: Debris[] = [];

  const columns = 3;
  const rows = 12;

  const pieceWidth = wallWidth / columns;
  const pieceHeight = wallHeight / rows;

  // создаём кусочки стены
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {

      // немного разный размер осколков
      const randomWidth =
        pieceWidth * (0.6 + Math.random() * 0.5);

      const randomHeight =
        pieceHeight * (0.6 + Math.random() * 0.5);

      const piece = new Graphics()
        .rect(
          -randomWidth / 2,
          -randomHeight / 2,
          randomWidth,
          randomHeight
        )
        .fill("lightblue");

      piece.x =
        wallX +
        col * pieceWidth +
        pieceWidth / 2;

      piece.y =
        wallY +
        row * pieceHeight +
        pieceHeight / 2;

      parent.addChild(piece);

      debris.push({
        object: piece,

        // сильный разлёт вправо
        vx: 3 + Math.random() * 12,

        // часть летит вверх, часть вниз
        vy: -12 + Math.random() * 12,

        // случайное вращение
        rotationSpeed:
          -0.2 + Math.random() * 0.4,
      });
    }
  }

  // убираем оригинальную стену
  wall.destroy();

  function animateDebris(): void {
    let alive = false;

    for (const debrisPiece of debris) {
      const piece = debrisPiece.object;

      if (piece.destroyed) continue;

      alive = true;

      // движение
      piece.x += debrisPiece.vx;
      piece.y += debrisPiece.vy;

      // гравитация
      debrisPiece.vy += 0.45;

      // небольшое торможение
      debrisPiece.vx *= 0.99;

      // вращение
      piece.rotation +=
        debrisPiece.rotationSpeed;

      // постепенно исчезает
      piece.alpha -= 0.012;

      if (piece.alpha <= 0) {
        piece.destroy();
      }
    }

    if (alive) {
      requestAnimationFrame(animateDebris);
    }
  }

  animateDebris();
}