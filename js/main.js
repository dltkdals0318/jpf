/* ===== MOBILE NAV ===== */
$(function () {
  // 서브메뉴 토글
  $(".header .nav .deps_1 > li > a").on("click", function (e) {
    if ($(".header").hasClass("on") === false) return;

    var $li = $(this).parent();
    if ($li.children(".deps_2").length === 0) return;

    e.preventDefault();
    e.stopPropagation();

    $li.toggleClass("active");
    $li.siblings("li").removeClass("active");
  });

  // 햄버거 열기
  $(".header .ham").click(function (e) {
    $(".header").addClass("on");
    e.stopPropagation();
  });

  // X 버튼 닫기
  $(".header .nav .close").click(function (e) {
    $(".header").removeClass("on");
    $(".header .nav .deps_1 > li").removeClass("active");
    e.stopPropagation();
  });

  // 바깥 클릭 시 닫기
  $(document).click(function () {
    if ($(".header").hasClass("on")) {
      $(".header").removeClass("on");
      $(".header .nav .deps_1 > li").removeClass("active");
    }
  });

  $(".header .nav").click(function (e) {
    e.stopPropagation();
  });
});

/* ===== HERO SLIDER ===== */
(function () {
  var slides = document.querySelectorAll("#heroSlider .slide");
  var current = 0;
  var timer;

  function goTo(n) {
    slides[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("active");
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
  function startAuto() { timer = setInterval(next, 5000); }
  function resetAuto() { clearInterval(timer); startAuto(); }

  document.querySelector("#heroSlider .next").addEventListener("click", function () { next(); resetAuto(); });
  document.querySelector("#heroSlider .prev").addEventListener("click", function () { prev(); resetAuto(); });

  startAuto();
})();

/* ===== SCROLL REVEAL ===== */
document.addEventListener("DOMContentLoaded", function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".scroll-reveal").forEach(function (el) {
    observer.observe(el);
  });
});
