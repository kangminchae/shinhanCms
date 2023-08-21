$(document).ready(function(){
	deviceChk();

	asideMenu();
	
    //layerPopClose
	$('.btnClose').click(function(){
		var $layerPop = $(this).closest('.layerPop');

		$layerPop.prev('.file').removeClass('active');
	});
  
  	//asideMenu
	$('.depth3').on('click',function(){
		$(this).toggleClass('active');
		$(this).next().slideToggle('active');
	});

	//본문 공통 : arrow
	$('.arrow').on('click', function(){
		$(this).toggleClass('active');
	});
	
  	//scrollTab
  	$('.tabcontents:first-child, .subTabcontents:first-child').show();

  	$('.tabMenuList li a').on('click', function(){
		var menuSelect = $(this);
			
		menuSelect.closest('li').siblings().removeClass('active');
		menuSelect.closest('li').addClass('active');
		menuSelect.closest('li').parents('.tabMenu').next().children().eq($(this).closest('li').index()).show().siblings().hide();
		menuSelect.parents('.tabWrap').removeClass ('active');
		menuSelect.parents('.tabWrap').find('.dim').remove();
		var left = $('.tabMenuList li.active').offset().left,
			curLeft = $('.tabMenu').scrollLeft();

		$('.tabMenu').animate({scrollLeft : curLeft+left}, 400);
  	});

  	$('.subTabMenu .tabMenuList li a').on('click', function(){
		var menuSelect = $(this);
			
		menuSelect.closest('li').siblings().removeClass('active');
		menuSelect.closest('li').addClass('active');
		menuSelect.closest('li').parents('.subTabMenu').next().children().eq($(this).closest('li').index()).show().siblings().hide();
		var left = $('.subTabMenu .tabMenuList li.active').offset().left - 18,
			curLeft = $('.subTabMenu').scrollLeft();

		$('.subTabMenu').animate({scrollLeft : curLeft+left}, 400);

  	});

  	$('.moreArea').each(function(){
		if($(this).hasClass('on')){
			$(this).closest('.tabMenu').find('.tabMenuList li:last-child').css('padding-right','7.5rem');
		}
  	});

  	$('.btnMenu_more').on('click', function(){
		$(this).toggleClass('active');
		$(this).parents('.tabWrap').toggleClass('active');
		$(this).parents('.tabWrap').append('<div class="dim"></div>');

		if(!$('.tabWrap').hasClass('active')) {
			$(this).parents('.tabWrap').find('.dim').remove();
		}

		var left = $('.tabMenuList li.active').offset().left,
			curLeft = $('.tabMenu').scrollLeft();

		$('.tabMenu').animate({scrollLeft : curLeft+left}, 400);
  	});


  	
});

$(window).resize(function() {
	asideMenu();

	//page contents scroll
	$('.scroll.contDetail').each(function(){
		var height = $('.contentsDetailWrap').height() - $('.contHeader').height() - 20;
		$(this).css('height', height);
	});
 });

$(window).on('load', function(){
	//subMenu
    var customSelect = $('.select_menuList');
	customSelect.each(function() {
		var that = $(this);
		var listID = that.attr('id'),
			theOptions = "",
			startingOption = "",
			customSelect = "";

            that.children('option').each(function() {
				var curOpt = $(this);
				var curVal = curOpt.attr('value'),
					curHtml = curOpt.html(),
					isSelected = curOpt.attr('selected');
				if(isSelected === 'selected') {
					startingOption = curHtml;
					theOptions += '<li class="selected" data-value="' + curVal + '">' + curHtml + '</li>';
				}else {
					theOptions += '<li data-value="' + curVal + '">' + curHtml + '</li>';
				}
			});

		customSelect = '<div class="dropdown-select entypo-down-open-big"><span>' + startingOption + '</span></div><div class="dropdown-container"><div class="dropSelectWrap"><ul class="dropdown-select-ul" data-role="' + listID +'">' + theOptions + '</ul><div class="dim"></div></div></div>';
		$(customSelect).insertAfter(that);
		
	});
	
	var	menuSelectdd = $('.subMenuWrap .dropdown-select'),
		menuSelectli = $('.subMenuWrap .dropdown-select-ul li');

	menuSelectdd.on('click',function(){
		$(this).toggleClass('active');
		$(this).next('.dropdown-container').toggleClass('active');
	});

	$('.dim').on('click',function(){
		$(this).parents('.dropdown-container').removeClass('active');
		$(this).parents('.subMenuWrap').find('.dropdown-select').removeClass('active');
	});

	menuSelectli.on('click',function(){
		var that = $(this);
		var	parentUl = that.parent('ul'),
            thisdd = parentUl.parents('.dropdown-container').prev('.dropdown-select'),
            lihtml = that.html(),
            livalue = that.attr('data-value'),
            originalSelect = '#' + parentUl.attr('data-role');

        parentUl.next('.dropdown-container').toggleClass('active');
		parentUl.parents('.subMenuWrap').find('.dropdown-select').toggleClass('active');
        that.siblings('li').removeClass('selected');
        that.addClass('selected');
        $(originalSelect).val(livalue);
        thisdd.children('span').html(lihtml);
	});

	//select : bottomSheetType 
	var popSelect = $('.selectBox');
	popSelect.each(function() {
		var that = $(this);
		var listID = that.attr('id'),
			theOptions = "",
			startingOption = "",
			popSelect = "";

            that.children('option').each(function() {
				var curOpt = $(this);
				var curVal = curOpt.attr('value'),
					curHtml = curOpt.html(),
					isSelected = curOpt.attr('selected');
				if(isSelected === 'selected') {
					startingOption = curHtml;
					theOptions += '<li class="selected" data-value="' + curVal + '">' + curHtml + '</li>';
				}else {
					theOptions += '<li data-value="' + curVal + '">' + curHtml + '</li>';
				}
			});
		popSelect = '<div class="dropdown-select entypo-down-open-big"><span>' + startingOption + '</span></div><div class="popWrap popBottom"><div class="dropdown-container"><div class="dropSelectWrap"><ul class="dropdown-select-ul" data-role="' + listID +'">' + theOptions + '</ul><div class="dim"></div></div></div></div>';
		$(popSelect).insertAfter(that);	
	});
	var	selectdd = $('.dropdown-select'),
		selectli = $('.dropdown-select-ul li');

	selectdd.on('click',function(){
		$(this).next('.popWrap').addClass('active');
		$(this).next('.popWrap').children('.dropdown-container').toggleClass('active');
	});

	$('.dim').on('click',function(){
		$(this).parents('.popWrap').removeClass('active');
		$(this).parents('.dropdown-container').removeClass('active');
	});

	selectli.on('click',function(){
		var that = $(this);
		var	parentUl = that.parent('ul'),
            thisdd = parentUl.parent('.dropSelectWrap').closest('.popWrap').prev('.dropdown-select'),
            lihtml = that.html(),
            livalue = that.attr('data-value'),
            originalSelect = '#' + parentUl.attr('data-role');

        parentUl.parents('.dropdown-container').toggleClass('active');
		parentUl.parents('.popWrap').removeClass('active');
        that.siblings('li').removeClass('selected');
        that.addClass('selected');
        $(originalSelect).val(livalue);
        thisdd.children('span').html(lihtml);
	});	

	//select : listType 
	var listSelect = $('.selectBox_list');
	listSelect.each(function() {
		var that = $(this);
		var listID = that.attr('id'),
			theOptions = "",
			startingOption = "",
			listSelect = "";

            that.children('option').each(function() {
				var curOpt = $(this);
				var curVal = curOpt.attr('value'),
					curHtml = curOpt.html(),
					isSelected = curOpt.attr('selected');
				if(isSelected === 'selected') {
					startingOption = curHtml;
					theOptions += '<li class="selected" data-value="' + curVal + '">' + curHtml + '</li>';
				}else {
					theOptions += '<li data-value="' + curVal + '">' + curHtml + '</li>';
				}
			});
		listSelect = '<div class="dropdown-select entypo-down-open-big"><span>' + startingOption + '</span></div><div class="dropdown-container"><div class="dropSelectWrap"><ul class="dropdown-select-ul" data-role="' + listID +'">' + theOptions + '</ul></div></div>';
		$(listSelect).insertAfter(that);	
	});
	
	var	listSelectdd = $('.selectListWrap .dropdown-select'),
		listSelectli = $('.selectListWrap .dropdown-select-ul li');

	listSelectdd.on('click',function(){
		$(this).toggleClass('active');
		$(this).next('.dropdown-container').toggleClass('active');
	});

	listSelectli.on('click',function(){
		var that = $(this);
		var	parentUl = that.parent('ul'),
            thisdd = parentUl.parent('.dropSelectWrap').closest('.dropdown-container').prev('.dropdown-select'),
            lihtml = that.html(),
            livalue = that.attr('data-value'),
            originalSelect = '#' + parentUl.attr('data-role');

        parentUl.parent('.dropSelectWrap').closest('.dropdown-container').toggleClass('active');
        that.siblings('li').removeClass('selected');
        that.addClass('selected');
        $(originalSelect).val(livalue);
        thisdd.children('span').html(lihtml);
	});
});

$(window).scroll(function() {
	if($(document).scrollTop() > $('#header').height() + $('.tabMenu').height()) {
		var tabHeight = $('#header').height() + $('.tabMenu').height();
		$('.subTabMenu').addClass('active');
   	} else {
		$('.subTabMenu').removeClass('active');
	}
});


/* iOS or Android ? */
function deviceChk(){
	if( /Android/i.test(navigator.userAgent)) {
		$('#wrap').addClass('android');
	}else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		$('#wrap').addClass('ios');
	}
};

/* iOS position:fixed bug */
var fixedPosChg = function(){
	var pos;
	var iosFlag = navigator.userAgent.match(/iPhone|iPad|iPod/i) == null ? false : true;
};

//popUP 
function fnShowPop(sGetName){
    var $layer = $("#"+ sGetName);
  
    $layer.addClass("active");
    $layer.find('.popHeader').prepend('<a href="#" class="mod"></a>');
    $layer.find('.mod').focus();
    $layer.not('.asideMenuWrap, .popFull').append('<div class="dim"></div>');
    $('body').css('overflow','hidden');

	$('.dim, .btn_popBottomClose').click(function(){
		$layer.removeClass("active");
		$layer.find('.mod').remove();
		$layer.find('.dim').remove();
		$('body').css('overflow','auto');
	});
  };
  
function fnHidePop(sGetName){
	var $layer = $("#"+ sGetName);

	$layer.removeClass("active");
	$layer.find('.mod').remove();
	$layer.find('.dim').remove();

	$('body').css('overflow','auto');
};


function asideMenu(){
	$(document).each(function(){
		var depth3 = $('.depth2Area .menuList li').children('ul');
		if(depth3.hasClass('depth3List')) {
			depth3.prev().addClass('depth3');
		}
	});

	var windowWidth = $(window).width();
	if(windowWidth < 900) {
		$(document).each(function(){
			var depth3 = $('.depth2Area .menuList li').children('ul');
			if(depth3.hasClass('depth3List')) {
				depth3.prev().addClass('active');
				depth3.show();
			}
	
			var Height = $(window).innerHeight() - $('.menuHeader').innerHeight() - $('.kyeMenu').innerHeight() - $('.menuListBox .title').innerHeight();
			$('.depth2Area .menuList').css('height', Height);
	
		});
	
		$('.depth1Area .menuList li a').on('click', function(){
			$(this).closest('li').addClass('active').siblings('li').removeClass('active');
			$(this).closest('li').parents('.depth1Area').next().children().eq($(this).closest('li').index()).css('display','flex').siblings().hide();
		});
	} else {
		$(document).each(function(){
			var depth3 = $('.depth2Area .menuList li').children('ul');
			if(depth3.hasClass('depth3List')) {
				depth3.prev().removeClass('active');
				depth3.hide();
			}
	
			$('.depth2Area .menuList').css('height', 'auto');
	
		});
	}
	
}
