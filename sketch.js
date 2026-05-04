let capture;
let faceMesh;
let faces = [];
let isModelReady = false;
// 唇部連線編號
const lipIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
// 定義右眼的外圈與內圈編號
const rightEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
// 定義左眼的外圈與內圈編號
const leftEyeOuter = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255];
const leftEyeInner = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
// 定義臉部最外層輪廓（剪影）編號
const faceSilhouette = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

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
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipHorizontal: false }, () => {
    console.log("Model Loaded!");
    isModelReady = true;
  });
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  background('#e7c6ff');

  // 確保攝影機已準備好且有影像尺寸資料
  if (!capture.elt || capture.elt.videoWidth === 0) {
    return;
  }

  let vW = 640; // 使用固定寬度或依比例
  let vH = capture.elt.videoHeight * (vW / capture.elt.videoWidth);

  push();
  translate(width / 2, height / 2); // 移動到畫面中心
  scale(-1, 1); // 左右翻轉影像
  imageMode(CENTER);
  image(capture, 0, 0, vW, vH);

  // 繪製指定的臉部特徵點線條
  if (faces && faces.length > 0) {
    let keypoints = faces[0].keypoints;

    stroke(255, 0, 0); // 線條採用紅色
    strokeWeight(1);   // 依要求設為 1
    noFill();

    // 1. 繪製唇部 (你指定的編號)
    drawContour(keypoints, lipIndices, vW, vH);

    strokeWeight(2); // 眼睛用稍粗一點
    // 繪製外圈 (247)
    drawContour(keypoints, rightEyeOuter, vW, vH);
    
    // 繪製內圈 (246)
    drawContour(keypoints, rightEyeInner, vW, vH);

    // 繪製左眼外圈 (467)
    drawContour(keypoints, leftEyeOuter, vW, vH);

    // 繪製左眼內圈 (466)
    drawContour(keypoints, leftEyeInner, vW, vH);

    // 繪製臉部最外層輪廓
    drawContour(keypoints, faceSilhouette, vW, vH);
  }
  pop();

  // 狀態提示
  fill(255, 0, 0);
  noStroke();
  textSize(16);
  if (!isModelReady) {
    text("⌛ 模型載入中，請稍候...", 20, 30);
  } else if (faces.length === 0) {
    text("🔍 正在尋找臉部...", 20, 30);
  } else {
    text("✅ 偵測成功！臉部數量: " + faces.length, 20, 30);
  }
}

// 輔助函式：利用 line 指令串接指定的特徵點陣列
function drawContour(points, indices, vW, vH) {
  for (let i = 0; i < indices.length; i++) {
    let p1 = points[indices[i]];
    let p2 = points[indices[(i + 1) % indices.length]];

    if (p1 && p2) {
      let x1 = map(p1.x, 0, capture.elt.videoWidth, -vW / 2, vW / 2);
      let y1 = map(p1.y, 0, capture.elt.videoHeight, -vH / 2, vH / 2);
      let x2 = map(p2.x, 0, capture.elt.videoWidth, -vW / 2, vW / 2);
      let y2 = map(p2.y, 0, capture.elt.videoHeight, -vH / 2, vH / 2);
      line(x1, y1, x2, y2);
    }
  }
}

function gotFaces(results) {
  faces = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
