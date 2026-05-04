let capture;

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide(); // 隱藏預設產生的 HTML video 元件
}

function draw() {
  background('#e7c6ff');

  let vW = windowWidth * 0.5; // 寬度為全螢幕的 50%
  let vH = capture.height * (vW / capture.width); // 依比例計算高度

  push();
  translate(width / 2, height / 2); // 移動到畫面中心
  scale(-1, 1); // 左右翻轉影像
  imageMode(CENTER);
  image(capture, 0, 0, vW, vH);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
