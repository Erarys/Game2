<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
} from "pixi.js";

const gameElement = ref<HTMLDivElement | null>(null);

let app: Application | null = null;

onMounted(async () => {
  if (!gameElement.value) return;

  app = new Application();

  await app.init({
    width: 1200,
    height: 600,
    background: "#87ceeb",
    antialias: true,
  });

  gameElement.value.appendChild(app.canvas);

  // Весь игровой мир
  const world = new Container();

  // Отдельные слои
  const backgroundLayer = new Container();
  const mapLayer = new Container();
  const objectLayer = new Container();
  const effectLayer = new Container();

  world.addChild(
    backgroundLayer,
    mapLayer,
    objectLayer,
    effectLayer,
  );

  app.stage.addChild(world);

  // Загружаем карту
  const mapTexture = await Assets.load("/maps/map.png");
  const mapSprite = new Sprite(mapTexture);

  mapSprite.position.set(0, 0);

  // Карта добавляется первой, поэтому находится сзади
  backgroundLayer.addChild(mapSprite);

  // Танк
  const tank = new Graphics()
    .rect(0, 0, 160, 80)
    .fill(0x3f6212);

  tank.position.set(200, 400);
  objectLayer.addChild(tank);

  // Стена
  const wall = new Graphics()
    .rect(0, 0, 50, 300)
    .fill(0xadd8e6);

  wall.position.set(700, 200);
  objectLayer.addChild(wall);
});

onUnmounted(() => {
  app?.destroy(true, {
    children: true,
  });

  app = null;
});
</script>

<template>
  <div ref="gameElement" class="game"></div>
</template>

<style scoped>
.game {
  width: 100%;
  overflow: hidden;
}

.game :deep(canvas) {
  display: block;
}
</style>
