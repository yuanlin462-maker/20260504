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

  // 確保攝影機已準備好且有影像尺寸資料
  if (!capture.elt || capture.elt.videoWidth === 0) return;

  let vW = windowWidth * 0.5; // 寬度為全螢幕的 50%
  let vH = capture.elt.videoHeight * (vW / capture.elt.videoWidth); // 依比例計算高度

  push();
  translate(width / 2, height / 2); // 移動到畫面中心
  scale(-1, 1); // 左右翻轉影像
  imageMode(CENTER);
  image(capture, 0, 0, vW, vH);

  // 繪製指定的臉部特徵點線條
  if (faces && faces.length > 0) {
    let keypoints = faces[0].keypoints;
    
    stroke(255, 0, 0); // 線條採用紅色
    strokeWeight(15); // 線條粗細為 15
    noFill();

    // 利用 line 指令串接所有編號
    for (let i = 0; i < lipIndices.length; i++) {
      // 取得當前點與下一個點（最後一個點會連回第一個點）
      let p1 = keypoints[lipIndices[i]];
      let p2 = keypoints[lipIndices[(i + 1) % lipIndices.length]];

      if (p1 && p2) {
        // 將座標從原始影片解析度映射到畫布上的置中影像範圍
        let x1 = map(p1.x, 0, capture.elt.videoWidth, -vW / 2, vW / 2);
        let y1 = map(p1.y, 0, capture.elt.videoHeight, -vH / 2, vH / 2);
        let x2 = map(p2.x, 0, capture.elt.videoWidth, -vW / 2, vW / 2);
        let y2 = map(p2.y, 0, capture.elt.videoHeight, -vH / 2, vH / 2);
        
        line(x1, y1, x2, y2);
      }
    }
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
