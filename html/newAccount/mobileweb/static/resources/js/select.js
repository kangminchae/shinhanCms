function selectFunc(){
    //browser 
    var $body = $('body'),
            $userAgent = navigator.userAgent.toUpperCase(),
            $is_ie = navigator.appName.match('Microsoft Internet Explorer'),
            $is_ie6 = $userAgent.indexOf('MSIE 6') > -1 && $userAgent.indexOf('TRIDENT') == -1,
            $is_ie7 = $userAgent.indexOf('MSIE 7') > -1 && $userAgent.indexOf('TRIDENT') == -1,
            $is_ie8 = $userAgent.indexOf('MSIE 8') > -1,
            $is_ie9 = $userAgent.indexOf('MSIE 9') > -1,
            $is_ie10 = $userAgent.indexOf('MSIE 10') > -1,
            $is_ie11 = $userAgent.match(/(TRIDENT\/7.0)(?:.*RV:11.0)/),
            $is_ie_competView =  $userAgent.indexOf('MSIE 7') > -1 && $userAgent.indexOf('TRIDENT') > -1,
            $old_browser = '<div class="old_browser">' + 
            '<p>�ъ슜 以묒씠�� 釉뚮씪�곗��� �ㅻ옒�� 踰꾩쟾�� 釉뚮씪�곗��닿린�� 蹂댁븞 諛� �깅뒫 臾몄젣媛� �덉뒿�덈떎. <a href="http://browsehappy.com/" target="_blank" title="�� 李�">釉뚮씪�곗�瑜� �낃렇�덉씠��</a> �섏떆硫� 蹂대떎 鍮좊Ⅴ怨� �덉쟾�섍쾶 �뱀쓣 �댁슜�섏떎 �� �덉뒿�덈떎. </p>' + 
            '<p>�덈줈�� 釉뚮씪�곗� �ㅼ튂媛� 遺��댁뒪�ъ슦�쒕㈃ <a href="http://www.google.com/chromeframe/?redirect=true" target="_blank" title="�� 李�"> 援ш� �щ＼�꾨젅��</a>�� �ㅼ튂�대낫�몄슂.�꾩옱 釉뚮씪�곗�瑜� 洹몃�濡� �곗떆��, �띾룄�� �덉젙�깆쓣 �μ긽 �쒗궗 �� �덉뒿�덈떎.</p>' + 
            '</div>';
    function addAgent(e){$body.addClass(e);}

    if ($is_ie6){$body.html($old_browser);}
    else if ($is_ie7){addAgent('ie7');} 
    else if ($is_ie8){addAgent('ie8');} 
    else if ($is_ie9){addAgent('ie9');} 
    else if ($is_ie10){addAgent('ie10');} 
    else if ($is_ie11){addAgent('ie11');}
    else if ($is_ie_competView){addAgent('ie_cv');}
    else if (!$is_ie){
            var $vendor = navigator.vendor.toUpperCase(),
                    $is_op = $vendor.indexOf('OPERA')>-1,
                    $is_ch = $userAgent.indexOf('CHROME')>-1,
                    $is_sf = $userAgent.indexOf('APPLE')>-1,
                    $is_ff = $userAgent.indexOf('FIREFOX') > -1;
            if($is_op){addAgent('op');}
            else if ($is_ch){addAgent('ch');}
            else if ($is_sf){addAgent('sf');} 
            else if ($is_ff){addAgent('ff');}
    }//browser

    //select 
    var $select_box = $('.select');
    if($select_box){
        for (var i = 0; i < $select_box.length; i++) {//select_box
            var $select = $select_box.eq(i).find('select');
            var $option = $select_box.eq(i).find('option');
            $select.hide();
            //媛��� ���됲듃 �꾨젅�� �앹꽦
            $select_box.eq(i).append('<div><p><a href="#none"></a></p><div class="option_box"><ul></ul></div></div>');
            var $option_box =  $select_box.find('.option_box');
            var $div = $select_box.eq(i).find('div');
            var $p = $select_box.eq(i).find('p a');
            var $ul =  $select_box.eq(i).find('ul')
            for (var j = 0; j < $option.length; j++) { //select option
                //媛��� option �앹꽦
                $ul.append('<li><span></span></li>');
                var $this = $option.eq(j);
                var $span = $this.parents('.select').find('li span');
                    $span.eq(j).text($option.eq(j).text()); 
                (function(index){
                    //媛��� value �ㅼ젙
                    var $option_selected = $select_box.eq(i).find('option:selected').text();
                        $p.text($select_box.eq(i).find('option:selected').text());
                        //媛��� option over class �ㅼ젙
                    if($ul.find('li').eq(index).text()==$option_selected){
                        $ul.find('li').removeClass('on').eq(index).addClass('on');
                    }
                })(j);
                //option �좏깮 action
                $span.eq(j).on('click', (function(index){
                    return function(){
                        $(this).parent('li').addClass('on').siblings('li').removeClass('on');
                        $option_box.hide();
                        $(this).parents('.select').find('p a').text($(this).parents('ul').find('span').eq(index).text());
                        // $(this).parents('.select').find('option').prop("selected", false);
                        $(this).parents('.select').find('option').removeAttr('selected');
                        $(this).parents('.select').find('option').eq(index).attr('selected','selected').siblings('option')
                        /*alert($(this).parents('.select').find('option:selected').text());*/
                        
                        //**************************************************************************
                        //confirm �대깽��
                        //**************************************************************************
                        if ($(this).parents('.select').attr('id') == "acctEstObjCodeWrap") {
                    		if ($('#acctEstObjCode option:selected').val() == '6') {
                    			$('#rmk1').prop('disabled', false);
                    		} else {
                    			$('#rmk1').val('');
                    			$('#rmk1').prop('disabled', true);
                    		}
                        }
                    }
                })(j));
            }//for j select option
            $p.on('click',function(){
                $option_box.hide();
                $(this).focus();
                $(this).parents('.select').find('.option_box').show();
            });
            $('body').on('click',function(e){
                var $this = $(this);
                var $target = $(e.target);
                if(!$target.parents().hasClass('select')){
                    $option_box.hide();
                }
            });
            $p.keydown(function(event){
                var $area = $(this).parents('.select');
                var $index = $(this).parents('.select').find('ul li.on').prevAll('li').length;
                if (event.which==37 && $area.find('.option_box').css('display')=='none'){//left
                    event.preventDefault();
                    $area.find('ul li.on').prev('li').addClass('on').siblings().removeClass('on');
                    var $val = $area.find('ul li.on').text();
                    $(this).text($val);
                    if($index>0){
                        $area.find('option').eq($index - 1 ).attr('selected','selected').siblings('option').removeAttr('selected');
                    }
                } else if (event.which==38){//up
                    event.preventDefault();
                    $area.find('ul li.on').prev('li').addClass('on').siblings().removeClass('on');
                    var $val = $area.find('ul li.on').text();
                    $(this).text($val);
                    if($index>0){
                        $area.find('option').eq($index - 1 ).attr('selected','selected').siblings('option').removeAttr('selected');
                    }
                } else if(event.which==39 && $area.find('.option_box').css('display')=='none'){//right
                    event.preventDefault();
                    $area.find('ul li.on').next('li').addClass('on').siblings().removeClass('on');
                    var $val = $area.find('ul li.on').text();
                    $(this).text($val);
                    $area.find('option').eq($index + 1 ).attr('selected','selected').siblings('option').removeAttr('selected');
                } else if(event.which==40){//down
                    event.preventDefault();
                    $area.find('ul li.on').next('li').addClass('on').siblings().removeClass('on');
                    var $val = $area.find('ul li.on').text();
                    $(this).text($val);
                    $area.find('option').eq($index + 1 ).attr('selected','selected').siblings('option').removeAttr('selected');
                } else if (event.which==13){//enter
                    event.preventDefault();
                    $(this).parents('.select').find('.option_box').toggle();
                } else if (event.which==9){//tab
                    if($(this).parents('.select').find('.option_box').css('display') == 'block'){
                        event.preventDefault();
                        $(this).parents('.select').find('.option_box').hide();
                    }
                }
            }); //$p.keydown
        }//for i 
    }//select_box
}

//�붾㈃蹂꾨줈 泥섎━�� -> TR�먯꽌 �듭뀡媛� 遺덈윭���� select洹몃━�� 寃쎌슦 寃뱀튂�� 臾몄젣 諛쒖깮
//$(function(){
//    selectFunc();
//});