let capture;
let faceMesh;
let faces = [];
const lipIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 明確指定不擷取聲音，這有助於避免因找不到麥克風而觸發的 NotFoundError
  capture = createCapture({
    video: true,
    audio: false
  });
  capture.size(640, 480); // 強制設定擷取解析度，確保模型穩定
  capture.hide(); // 隱藏預設產生的 HTML video 元件

  // 初始化 ml5.js FaceMesh
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipHorizontal: false });
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  background('#e7c6ff');

  // 確保攝影機已準備好
  if (capture.width === 0 || capture.height === 0) return;

  let vW = windowWidth * 0.5; // 寬度為全螢幕的 50%
  let vH = capture.height * (vW / capture.width); // 依比例計算高度

  push();
  translate(width / 2, height / 2); // 移動到畫面中心
  scale(-1, 1); // 左右翻轉影像
  imageMode(CENTER);
  image(capture, 0, 0, vW, vH);

  // 繪製指定的臉部特徵點線條
  if (faces.length > 0) {
    let keypoints = faces[0].keypoints;
    
    noFill();
    stroke(255, 0, 0); // 線條採用紅色
    strokeWeight(15); // 線條粗細為 15
    
    beginShape();
    for (let i = 0; i < lipIndices.length; i++) {
      let index = lipIndices[i];
      let pt = keypoints[index];
      if (pt) {
        // 將座標從原始影片大小映射到畫布上的影像大小
        let x = map(pt.x, 0, capture.width, -vW / 2, vW / 2);
        let y = map(pt.y, 0, capture.height, -vH / 2, vH / 2);
        vertex(x, y);
      }
    }
    endShape(CLOSE); // 閉合線條
  }
  pop();
  
  // 簡單的 Debug 文字（非鏡像）
  fill(0);
  noStroke();
  textSize(16);
  text("Faces detected: " + faces.length, 20, 30);
}

function gotFaces(results) {
  faces = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
