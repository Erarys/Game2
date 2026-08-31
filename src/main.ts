import { Application, Graphics } from "pixi.js";
import { hitWall } from "./wallAnimate";

const app = new Application();

await app.init({
  width: 3000,
  height: 600,
  background: "grey",
});

document.body.appendChild(app.canvas);


function createWall(x: number, y: number): Graphics {
  const wall = new Graphics()
      .rect(0, 0, 50, 300)
      .fill("lightblue");

  wall.x = x;
  wall.y = y;
  wall.eventMode = "static";
  wall.cursor = "pointer";

  wall.on("pointerdown", () => {
    hitWall(wall);
  });

  app.stage.addChild(wall);

  return wall;
}
const walls: Graphics[] = [];

for (let i = 0; i < 5; i++){
  const wall = createWall(700 + i * 400, 180);
  walls.push(wall)
}

