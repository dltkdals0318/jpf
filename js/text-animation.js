// ═══════════════════════════════════════════════════════════════════
//  text-animation.js
//
//  동작 방식:
//   - 15개 SVG 글자가 일렬로 정렬됩니다
//   - 첫 슬라이드 로딩 시 즉시 표시 (진입 애니메이션 없음)
//   - 슬라이드 전환 시 이동 방향의 선두 글자부터 ㄹ자 경로로 이동합니다
//   - 왼쪽 이동 → 왼쪽(0번) 선두 / 오른쪽 이동 → 오른쪽(14번) 선두
// ═══════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // ╔═════════════════════════════════════════════════════════════╗
  // ║  ★  사용자 설정 영역  ★                                    ║
  // ╚═════════════════════════════════════════════════════════════╝

  var CHAR_GAP = -7; // 글자 사이 기본 간격 (px) — 음수면 겹침

  var CHAR_GAPS = [
    0, // 1↔2
    0, // 2↔3
    0, // 3↔4
    0, // 4↔5
    0, // 5↔6
    0, // 6↔7
    3.5, // 7↔8
    4, // 8↔9
    0, // 9↔10
    0, // 10↔11
    0, // 11↔12
    1, // 12↔13
    4, // 13↔14
    -2, // 14↔15
  ];

  // 슬라이드별 글자 크기 (px) — 슬라이드 전환 시 자연스럽게 변환됩니다
  var SLIDE_CHAR_HEIGHTS = [24];

  // 슬라이드별 글자 색상 [R, G, B] (각 0~255)
  // 예: [255, 255, 255] = 흰색,  [255, 200, 80] = 금색,  [100, 180, 255] = 하늘색
  var SLIDE_COLORS = [
    [255, 255, 255], // Slide 0
    [245, 130, 32], // Slide 1
    [0, 0, 0], // Slide 2
    [255, 255, 255], // Slide 3
    [255, 255, 255], // Slide 4
    [255, 255, 255], // Slide 5
    [255, 255, 255], // Slide 6
  ];

  // 색상 전환 시간 (ms)
  var COLOR_TRANSITION = 800;

  // 글자 간 출발 딜레이 (ms) — 클수록 기차가 길게 늘어짐
  var STAGGER = 30;

  // 한 글자의 이동 완료 시간 (ms)
  var DURATION = 1000;

  // ㄹ자 경로 설정
  // SNAKE_PIVOT : 꺾임 지점의 X 위치 비율 (0~1)
  //   0.5 = fromX~toX 중간에서 꺾임,  0 = 출발점에서 바로 꺾임,  1 = 도착점 직전에 꺾임
  var SNAKE_PIVOT = 0.5;

  // SNAKE_PHASES : [첫 수평 구간 끝, 수직 구간 끝] — 전체 t(0~1) 중 비율
  //   [0.38, 0.62] = 수평 38% → 수직 24% → 수평 38%
  //   [0.2,  0.8 ] = 수평 20% → 수직 60% → 수평 20%  (수직 강조)
  var SNAKE_PHASES = [0.38, 0.62];

  // 슬라이드별 글자 줄 시작 위치 [ 첫 글자 x,  줄 y ]  (0~1 비율)
  var SLIDE_ANCHORS = [
    [0.221, 0.625], // Slide 0
    [0.4, 0.4], // Slide 1
    [0.5, 0.55], // Slide 2
    [0.52, 0.38], // Slide 3
    [0.1, 0.42], // Slide 4
    [0.48, 0.4], // Slide 5
    [0.06, 0.4], // Slide 6
  ];

  var NUM_CHARS = 15;

  // ╔═════════════════════════════════════════════════════════════╗
  // ║  구현부 — 수정 불필요                                       ║
  // ╚═════════════════════════════════════════════════════════════╝

  var POSITIONS = [];

  function ss(t) {
    return t * t * (3 - 2 * t);
  } // smoothstep

  function buildPositions(W) {
    POSITIONS = SLIDE_ANCHORS.map(function (a, slideIdx) {
      var h = SLIDE_CHAR_HEIGHTS[slideIdx] || SLIDE_CHAR_HEIGHTS[0];
      var arr = [];
      var offsetX = 0;
      for (var i = 0; i < NUM_CHARS; i++) {
        arr.push({ x: a[0] + offsetX, y: a[1] });
        // 다음 글자까지의 간격 = 기본 간격 + 개별 보정값
        var extra = i < CHAR_GAPS.length ? CHAR_GAPS[i] : 0;
        offsetX += (h + CHAR_GAP + extra) / W;
      }
      return arr;
    });
  }

  var sketch = function (p) {
    var imgs = [];
    var chars = [];
    var currentSlide = 0;
    var W, H;

    // ── 색상 트랜지션 상태 ────────────────────────────────────────
    var colorFrom = (SLIDE_COLORS[0] || [255, 255, 255]).slice();
    var colorTo = colorFrom.slice();
    var colorStartTime = 0;
    var currentColor = colorFrom.slice();

    p.preload = function () {
      for (var i = 1; i <= NUM_CHARS; i++) {
        imgs.push(p.loadImage("./source/text/slidetext_title_" + i + ".svg"));
      }
    };

    p.setup = function () {
      var slider = document.getElementById("heroSlider");
      W = slider.offsetWidth;
      H = slider.offsetHeight;
      buildPositions(W);

      var cnv = p.createCanvas(W, H);
      cnv.parent("heroSlider");
      cnv.elt.style.position = "absolute";
      cnv.elt.style.top = "0";
      cnv.elt.style.left = "0";
      cnv.elt.style.pointerEvents = "none";
      cnv.elt.style.zIndex = "5";

      buildChars();
      snapToSlide(0); // 첫 슬라이드는 애니메이션 없이 즉시 표시
      watchSlider();
    };

    p.windowResized = function () {
      var slider = document.getElementById("heroSlider");
      W = slider.offsetWidth;
      H = slider.offsetHeight;
      p.resizeCanvas(W, H);
      buildPositions(W);
      snapToSlide(currentSlide);
    };

    p.draw = function () {
      p.clear();
      var now = p.millis();

      // 색상 트랜지션 업데이트
      var ct = Math.min((now - colorStartTime) / COLOR_TRANSITION, 1.0);
      var cs = ss(ct);
      currentColor = [
        colorFrom[0] + (colorTo[0] - colorFrom[0]) * cs,
        colorFrom[1] + (colorTo[1] - colorFrom[1]) * cs,
        colorFrom[2] + (colorTo[2] - colorFrom[2]) * cs,
      ];

      p.imageMode(p.CENTER);
      for (var i = 0; i < chars.length; i++) {
        tickChar(chars[i], now);
        paintChar(chars[i]);
      }
    };

    // ── 초기화 ──────────────────────────────────────────────────
    function buildChars() {
      chars = [];
      var h0 = SLIDE_CHAR_HEIGHTS[0] || 24;
      for (var i = 0; i < NUM_CHARS; i++) {
        chars.push({
          img: imgs[i],
          x: 0,
          y: 0,
          fromX: 0,
          fromY: 0,
          toX: 0,
          toY: 0,
          midX: 0,
          useSnake: false,
          startTime: 0,
          duration: DURATION,
          animating: false,
          opacity: 0,
          hasAppeared: false,
          renderHeight: h0,
          fromHeight: h0,
          toHeight: h0,
        });
      }
    }

    function getPx(slideIdx, charIdx) {
      var row = POSITIONS[slideIdx] || POSITIONS[0];
      var pos = row[charIdx] || { x: 0.5, y: 0.5 };
      return { x: pos.x * W, y: pos.y * H };
    }

    // ── 즉시 배치 ───────────────────────────────────────────────
    function snapToSlide(slideIdx) {
      var h = SLIDE_CHAR_HEIGHTS[slideIdx] || 24;
      var col = (SLIDE_COLORS[slideIdx] || [255, 255, 255]).slice();
      colorFrom = col;
      colorTo = col;
      currentColor = col.slice();
      for (var i = 0; i < NUM_CHARS; i++) {
        var pos = getPx(slideIdx, i);
        chars[i].x = pos.x;
        chars[i].y = pos.y;
        chars[i].toX = pos.x;
        chars[i].toY = pos.y;
        chars[i].animating = false;
        chars[i].opacity = 1;
        chars[i].hasAppeared = true;
        chars[i].renderHeight = h;
        chars[i].fromHeight = h;
        chars[i].toHeight = h;
      }
    }

    // ── 전환 시작 ────────────────────────────────────────────────
    function startTransition(toSlide) {
      var now = p.millis();

      // 색상 트랜지션 시작
      colorFrom = currentColor.slice();
      colorTo = (SLIDE_COLORS[toSlide] || [255, 255, 255]).slice();
      colorStartTime = now;

      // 왼쪽 이동 → 왼쪽(0번) 선두 / 오른쪽 이동 → 오른쪽(마지막) 선두
      var frontTo = getPx(toSlide, 0);
      var leftLeads = frontTo.x < chars[0].x;
      var toH = SLIDE_CHAR_HEIGHTS[toSlide] || 24;

      for (var i = 0; i < NUM_CHARS; i++) {
        var c = chars[i];
        var to = getPx(toSlide, i);
        c.toX = to.x;
        c.toY = to.y;
        c.fromX = c.x;
        c.fromY = c.y;
        c.useSnake = Math.abs(c.toY - c.fromY) > 2;
        c.midX = c.fromX + (c.toX - c.fromX) * SNAKE_PIVOT;
        c.fromHeight = c.renderHeight;
        c.toHeight = toH;

        var order = leftLeads ? i : NUM_CHARS - 1 - i;
        c.startTime = now + order * STAGGER;
        c.duration = DURATION;
        c.animating = true;
      }
    }

    // ── 위치 업데이트 ────────────────────────────────────────────
    function tickChar(c, now) {
      if (!c.animating) {
        c.x = c.toX;
        c.y = c.toY;
        return;
      }

      var elapsed = now - c.startTime;
      if (elapsed < 0) return; // 대기 중: 현재 위치 유지

      var t = Math.min(elapsed / c.duration, 1.0);

      if (c.useSnake) {
        // ─── ㄹ자 경로: 수평 → 수직 → 수평 ───────────────────
        var p1 = SNAKE_PHASES[0];
        var p2 = SNAKE_PHASES[1];

        if (t < p1) {
          var s = ss(t / p1);
          c.x = c.fromX + (c.midX - c.fromX) * s;
          c.y = c.fromY;
        } else if (t < p2) {
          var s = ss((t - p1) / (p2 - p1));
          c.x = c.midX;
          c.y = c.fromY + (c.toY - c.fromY) * s;
        } else {
          var s = ss((t - p2) / (1.0 - p2));
          c.x = c.midX + (c.toX - c.midX) * s;
          c.y = c.toY;
        }
      } else {
        // ─── 직선 이동 (Y 차이 없음) ──────────────────────────
        var s = ss(t);
        c.x = c.fromX + (c.toX - c.fromX) * s;
        c.y = c.fromY + (c.toY - c.fromY) * s;
      }

      c.opacity = 1;
      c.renderHeight = c.fromHeight + (c.toHeight - c.fromHeight) * ss(t);

      if (t >= 1.0) {
        c.x = c.toX;
        c.y = c.toY;
        c.renderHeight = c.toHeight;
        c.animating = false;
      }
    }

    // ── 렌더링 ──────────────────────────────────────────────────
    function paintChar(c) {
      if (c.opacity <= 0) return;
      var img = c.img;
      var h = c.renderHeight;
      var w = h;
      if (img.width > 0) w = (img.width / img.height) * h;
      p.tint(
        currentColor[0],
        currentColor[1],
        currentColor[2],
        c.opacity * 255,
      );
      p.image(img, c.x, c.y, w, h);
      p.noTint();
    }

    // ── 슬라이드 전환 감지 ───────────────────────────────────────
    function watchSlider() {
      var slides = document.querySelectorAll("#heroSlider .slide");
      var observer = new MutationObserver(function () {
        for (var i = 0; i < slides.length; i++) {
          if (slides[i].classList.contains("active") && i !== currentSlide) {
            currentSlide = i;
            startTransition(i);
            break;
          }
        }
      });
      slides.forEach(function (s) {
        observer.observe(s, { attributes: true, attributeFilter: ["class"] });
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      new p5(sketch);
    });
  } else {
    new p5(sketch);
  }
})();
