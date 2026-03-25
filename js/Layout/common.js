$(function(){

/* Layout */

 	// nav
	$.fn.nav = function(){
		var doc = $(document),
			header = $('#headermenu'),
			wrap = $('#wrap');
		doc.on('mouseenter', '#headermenu .gnb_menu > ul > li > a ', function(e){
			header.addClass('on');
			wrap.addClass('on');
		}).on('mouseleave', '#headermenu .gnb_menu', function(e){
			header.removeClass('on');
			wrap.removeClass('on');
		});
		wrap.click(function(e) { //태블릿에서 클릭시 닫히게
			if (!header.is(e.target) && header.has(e.target).length === 0 ){
				header.removeClass('on');
				wrap.removeClass('on');
			}
		});
	}
	$.fn.nav();

	// moblie nav
	$.fn.mnav = function(){
		var win = $(window),
			body = $('html, body'),
			mgnb = $('#mGnb'),
			gnbH = $('.gnb_head'),
			gnbC = $('.gnb_container'),
			btnMenu = $('#mHeader .btn_menu');
		btnMenu.on('click', function(){
			if (!body.hasClass('lock')) {
				body.addClass('lock').css({'overflow':'hidden','height':'100%'}).bind('touchmove', function(e){e.preventDefault()});
				mgnb.bind('touchmove', function(e){e.stopPropagation()});
			}
		});
		function closeNav(){
			body.removeClass('lock').css({'overflow':'','height':''}).unbind('touchmove');
		}
		mgnb.click(function(e) {
			if (!gnbH.is(e.target) && gnbH.has(e.target).length === 0 && !gnbC.is(e.target) && gnbC.has(e.target).length === 0){
				closeNav();
			}
		});
		$('#mGnb .gnb_menu > ul > li > ul > li > a').on('click', function(){
			closeNav();
		});
		if(win.width() > 1024) { //pc size
			closeNav();
		}
		win.resize(function() {
			if(win.width() > 1024) { //pc size
				closeNav();
			}
		});
	}
	$.fn.mnav();

	// moblie nav 메뉴
	var mgnbBtn = $('#mGnb .gnb_menu > ul > li > a');
	mgnbBtn.on('click', function(){
		if($(this).next().length == 0)
			return true;

		if($(this).parent().hasClass('on'))
			return true;

        var target = $(this).siblings('ul');
        if($(this).parent().hasClass('on')){
            $(this).parent().removeClass('on');
            $(target).hide();
        }else{
            $(this).parent().addClass('on').siblings().removeClass('on');;
            $(this).parent().siblings().children('ul').hide();
            $(target).show();
        }
        return false;
    });

	// header scroll
	$(window).scroll( function(){
		var header = $('#headermenu'),
			mheader = $('#mHeader'),
			headerH = header.height(),
			mheaderH = mheader.height(),
			scrTop = $(window).scrollTop();
		(scrTop > headerH) ? header.addClass('fix') : header.removeClass('fix');
		(scrTop > mheaderH) ? mheader.addClass('fix') : mheader.removeClass('fix');
	});

	// lnb
	$('.lnb_wrap .dep > a').click(function  () {
		$(this).parent().toggleClass('on');
		$(this).siblings().slideToggle(500);
		return false;
	});
	$('.lnb_wrap .dep').mouseleave(function  () {
		if ( $(this).find('.dep_list').css('display') == 'block' ) {
			$(this).removeClass('on');
			$(this).find('.dep_list').slideUp('fast');
		}
	});

	// family site
	$('.family_site .btn_open_fs').click(function(){
		if($(this).hasClass('active')){
			$(this).next().hide();
			$(this).removeClass('active');
		}else{
			$(this).next().show();
			$(this).addClass('active');
		}
    });

/* Common */

	// select
	var selectTarget = $('.selectbox select');
	selectTarget.change(function(){
		var select_name = $(this).children('option:selected').text();
		$(this).siblings('label').text(select_name);
	});


	// 더보기
	function viewMore(){
		// OliPass RNA
		var tr = $('.olpna3 .table_date tr'),
			btnMore = $('.olpna3 .btn_more');
		btnMore.on('click', function(){
			if (!btnMore.hasClass('active')) {
				btnMore.addClass('active');
				tr.css('display','table-row');
			} else {
                btnMore.removeClass('active');
                tr.css('display','none');
			}
		});
		// Pipeline
		var btnDetail = $('.pipeline .btn_detail');
		btnDetail.on('click', function(){
 			$(this).toggleClass('active');
 			$(this).parents('.chart_cell').siblings('.bar_wrap').children('.chart_txt').slideToggle();
		});
	}
	viewMore();

	// Pipeline chart
	$(window).scroll( function(){
		$('.pipeline .chart_bar').each( function(i){
			var bottom_of_element = $(".chart_body").offset().top + $(".chart_body").outerHeight()/4 + 250;
			var bottom_of_window = $(window).scrollTop() + $(window).height();
			if( bottom_of_window > bottom_of_element ){
				$(this).addClass("active");
			}
		});
	});

});
