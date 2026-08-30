const car = document.querySelector<HTMLDivElement>(".car");

if (car) {
  let hue = 0;
  let x = 0;
  let y = 0;

  function animate(): void {
    if (y != 0) {
     y = (y + 1) % 500;
     car.style.transform = `translateY(${y}px)`;
     car.style.transform = `translateX(${x}px)`;

    }
    else if (x != 360) {
      x += 1;
      car.style.transform = `translateX(${x}px)`;
    }
    else {
      y += 1
    }

    hue = (hue + 1) % 360;
    car.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;



    requestAnimationFrame(animate);
  }

  animate();
}
