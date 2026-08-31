import { Application, Graphics } from "pixi.js";
import { hitWall } from "./wallAnimate";

const app = new Application();

await app.init({
  width: 3000,
  height: 600,
  background: "grey",
});

document.body.appendChild(app.canvas);

// создаём стену
const wall = new Graphics()
  .rect(0, 0, 50, 300)
  .fill("lightblue");

wall.x = 700;
wall.y = 180;

app.stage.addChild(wall);

// через 2 секунды разрушаем
setTimeout(() => {
  hitWall(wall);
}, 2000);