var currStep = "01";			// 현재 step
var isSmsRequest = false;		// SMS인증 요청여부
var isSmsAuth = false;			// SMS인증 완료여부
var isAddrYn = false;			// 주소검증 여부
var isPasswordConfirm = false;

var zipNoTemp = "";				// 주소검색창 임시저장 변수 (우편번호)
var roadAddrTemp = "";			// 주소검색창 임시저장 변수 (도로명주소) 

var nffAcctEstStepCode = "";	// 비대면계좌개설단계코드
var certNo = "";				// 비대면임시고객번호
var acctTpCode = "";			// 비대면계좌구분코드
var nffRealnmCnfmYn = "";		// 비대면실명확인여부
var bankAcctNo = "";			// 은행계좌번호
var updateDealObj = $("#updateDealObj").val();			// 금융거래목적확인서 작성여부

$(document).ready(function() {
	console.log("현재스텝 > " + currStep);
	// 개인(신용)정보 처리 동의서 cross domain 해결 
	document.domain = domain;
	
	//시스템점검 공지 팝업
	checkOpen(false);
	
	/**
	 * 유치자 전용 계좌개설 (직원여부 확인)
	 */
	if($('#memNo').val() != ""){
		chkMember();
	}

	/**
	 * 티클모아카드일 경우 숨김처리 
	 * - 영문명
	 * - 계좌개설 스텝리스트 
	 */
	if($('#moaCardYn').val() == 'Y'){
		$('.engnmDiv').hide();
		$('#stepList01').hide();
	}
	
	try {
		initmTranskey();
		transkeyPoll();
		
		/**
		 * 직업정보
		 */
		$.ajax({
			url: "../data/common/getOccupation.jsp",
			type: 'post',
			dataType: 'json',
			success: function(rs){
				if (rs.ErrType != '0') {
					popup("", rs.errorMsg);
					return;
				}

				for (var i = 0, j = 0; i < rs.list01.length; i++) {
					$('#occIndcDtlCode').append("<option value=" + rs.list01[i].직업업종상세코드 + ">" + rs.list01[i].업종명 + "</option>");
				}
			},
			error: function(error) {
			},
			complete: function() {
				//가상 셀렉트박스 그리기
				selectFunc();
				
				$('#telcoTpCode option:eq(0)').attr('selected', true);						// 통신사
				$('#dealObj option:eq(0)').attr('selected', true);							// 거래목적
				$('#orgnSource option:eq(0)').attr('selected', true);						// 자금원천
				$('#occIndcDtlCode option:eq(0)').attr('selected', true);					// 직업
				$('#occIndcDtlCodeWrap div .option_box').css('top' , '-285px');
				$('#acctEstObjCode option:eq(0)').attr('selected', true);					// 금융거래목적
				
				$('#dealObjWrap .option_box > ul > li:eq(2) > span').trigger('click');		// 거래목적 디폴트 [저축 및 투자] 설정
				$('#orgnSourceWrap .option_box > ul > li:eq(1) > span').trigger('click');	// 자금원천 디폴트 [근로 및 연금소득] 설정
			}
		});
	} catch (e) {
		console.dir(e);
	}
	
	/**
	 *	 개인(신용)정보 처리 동의서(금융거래) 약관보기,체크박스
	 */
	$('input[id^=agr_00]').on('click', function(e){
		e.preventDefault();
		//e.stopPropagation();
		window.open(clause_url);
	})
	
	
	/**
	 * 엔터키로 인한 form submit 이벤트 제거
	 */
	$("#form").keypress(function(e) {
		if (event.keyCode == 13) {
			event.preventDefault();
		}
	});
	
	/**
	 * 이전버튼
	 */
	$('#btnPrev').on('click',function(){
		nextStep('00');
	})
	
	/**
	 * 닫기버튼
	 */
	$('.icon_poff').on('click',function(){
		if($('[id^=secAddress]').is(':visible')){ 
			//주소창 초기화
			$('#zipNoText').text('');
			$('#roadAddrText').text('');
			$('#jibunAddrText').text('');
			
			//주소검색 임시저장 변수 초기화
			zipNoTemp = "";
			roadAddrTemp = ""; 
			
			moveStep('02'); //계좌개설 영역 show
		}else if($('#moaCardYn').val() == 'Y'){
			//더모아카드
			popup('', '본인인증을 중단하시겠습니까?', function(){location.href = '../themore/invest-main.jsp';}, 'returnFunc');
		}else{
			//계좌개설
			popup('', '계좌개설을 중단하시겠습니까?', 'closeWindow', 'returnFunc');
		}
	});
	
	
	//**************************************************************************
	//주소검색 스크롤 이벤트
	//**************************************************************************
	$(window).scroll(function() {
		// address01 스텝에서 실행
		if (currStep == "address01") {
			// 스크롤이 끝에 닿을 경우 실행
			if ($(window).scrollTop() == $(document).height() - $(window).height()) {
				var nextPage = Number($('#currentPage').val()) + 1;
				if (nextPage <= Math.ceil($('#totalCount').val() / $('#countPerPage').val())) {
					$('#currentPage').val(nextPage);
	    			getAddr(1);
				}
			}
		}
	});

	//**************************************************************************
	//가상키보드 이벤트
	//**************************************************************************
	$("#sm2, #acctPwd, #acctPwdChk").click(function(e) {
		if (this.id == "acctPwd" || this.id == "acctPwdChk")
			isPasswordConfirm == false;
		
		mtk.onKeyboard(this);
	});

	//**************************************************************************
	//step02 이벤트
	//**************************************************************************
	$('.zipType').click(function(e) {
		e.preventDefault();
		$('.zipType').attr('class', 'zipType b_gray');
		$(this).attr('class', 'zipType b_blue');
		
		if ($(this).index() == 0) {
			$('#zipType').val('1');
		} else {
			$('#zipType').val('2');
		}
	});
	
	$('.realOwner').click(function(e) {
		e.preventDefault();
		$('.realOwner').attr('class', 'realOwner b_gray');
		$(this).attr('class', 'realOwner b_blue');
		
		if ($(this).index() == 0) {
			$('#realOwner').val('Y');
		} else {
			$('#realOwner').val('N');
		}
	});
	
	$('#addrOpen').click(function(){
		nextStep('address01'); //주소검색 영역 show
	});

    $('#tax_notice').click(function(){
        var contents = '';
            contents += '<ul class="dot_list fz12">';
        	contents += '<li>본인확인서는「정보교환협정에 따른 금융정보자동교환이행규정」과 「대한민국 정부와 미합중국 정부 간의 납세의무 촉진을 위한 협정에 따른 금융정보자동교환이행규정」에 따라 당사와 거래 시 본인 확인을 하기 위해 작성이 요구되는 필수서식으로 관련 정보를 제공하지 않거나 허위로 제공할 경우, 「국제조세조정에 관한법률」제36조 제9항에 따라 계좌개설이 거절되거나 거래제한이 발생할 수 있으며, 국세청에 의무이행 방해자로 신고 될 수있습니다.</li>';
        	contents += '<li>확인 내용에 변경이 있는경우, 변경일로부터60일 이내 회사에 통지하겠습니다.</li>';
        	contents += '</ul>';
		popup("", contents);
	});

	$('label[for="tax_2"]').click(function(){
           var contents = '';
               contents += '<p class="fz12 tac">';
               contents += '다른 나라에서 세금을 내고 계신 경우,<br />비대면 계좌개설을 할 수 없어요.<br />가까운 영업점을 방문해 주세요.';
               contents += '</p>';
    	popup("", contents);
    });

	//**************************************************************************
	//주소검색창 이벤트
	//**************************************************************************
	
	/**
	 * address01 영역 : 주소검색영역 이벤트
	 */
	$("#addrSearchKeyword").keypress(function(e) {
		if(e.which == 13)
			getAddr(0);
	});
	
	/**
	 * address01 영역 : 주소검색 버튼클릭 이벤트
	 */
	$("#btnAddress").click(function(e) {
		e.preventDefault();
		getAddr(0);
	});
	
	/**
	 * address02 영역 :상세주소입력 후 다음버튼 클릭 이벤트
	 */
	$("#secAddressNext").click(function(){
		if ($('#addrDetailTemp').val() == '') { //addrDetailTemp : 주소창입력영역
			popup("", "상세주소를 입력해주세요.");
			return false;
		}
		
		var param ={
			addr: roadAddrTemp + " " +$('#addrDetailTemp').val()
		};
		
		clearAddr();
		
		loading("처리중 입니다.");
		$.ajax({
			url: "../data/common/chkAddr.jsp",
			data: param,
			type: 'post',
			async: false,
			dataType: 'json',
			success: function(rs) {
				if (rs.ErrType!='0') {
					popup("", rs.errorMsg);
					return;
				}
				
				if (rs['주소검증결과코드'] != '10') {
					popup("", "도로명 주소 검증에 실패했습니다.");
					return;
				}
				
				$('#zip').val(rs['우편번호2']);
				$('#zipSeq').val(rs['기타2우편번호순번']);
				$('#zipAddr').val(rs['기타세부주소2']);
				
				$('#zipNo').val(rs['우편번호2']);
				$('#roadAddr').val(rs['주소2']+" "+rs['기타세부주소2']);
				
				isAddrYn = true;
				
				nextStep('02');
			},
			error: function(error) {
				popup("", "주소 검증에 실패하셨습니다.");
			},
			complete: function() {
				loadingHide();
			}
		});
		
	});
	
	//**************************************************************************
	//confirm 이벤트
	//**************************************************************************
	$('.yn1').click(function(e) {
		e.preventDefault();
		$('.yn1').attr('class', 'yn1 b_gray');
		$(this).attr('class', 'yn1 b_blue');
		
		if ($(this).index() == 0) {
			$('#yn1').val('Y');
		} else {
			$('#yn1').val('N');
		}
	});
	
	$('.yn2').click(function(e) {
		e.preventDefault();
		$('.yn2').attr('class', 'yn2 b_gray');
		$(this).attr('class', 'yn2 b_blue');
		
		if ($(this).index() == 0) {
			$('#yn2').val('Y');
		} else {
			$('#yn2').val('N');
		}
	});
	
	//**************************************************************************
	//인증번호 6자리 입력 시 확인처리
	//**************************************************************************
	$('#smsAuthNo').keyup(function(e) {
		if ($('#smsAuthNo').val().length == 6) {
			nextStep('02');
		}
	});
	
});

//******************************************************************************
//함수
//******************************************************************************

/**
 * 계좌개설 중단시 소실되는 데이터 임시저장 
 * solr -> TR (2020.11.16)
 * key : 비대면 임시고객번호
 * 값 :영문명
 * */
function tempDataAdd(callback){
	if($('#moaCardYn').val() == 'Y'){
		//더모아의 경우 영문명을 입력받지 않기때문에 skip
		callback();
		return;
	}
	var f_data = { engnm1 : $('#engnm1').val(), engnm2 : $('#engnm2').val() }
	if (updateDealObj != "" && updateDealObj != "null" && updateDealObj != null){
		f_data.updateDealObj = updateDealObj;
	}
	
	$.ajax({
		url: "../data/common/tempDataUpdate.jsp",
		data: f_data,
		type: 'post',
		dataType: 'json',
		success:function(rs){
			callback();
		},
		error: function(request, status, error){
			popup("","저장소 업데이트에 실패하였습니다.",callback());
		},
		complete: function() {
		}
	});
}

/**
 * 유치자 전용 계좌개설 (직원번호 유효성확인 / 투자권유대행인 여부확인)
 */
function chkMember(){
	$.ajax({
		url: "../data/common/chkMember.jsp",
		data: {
				memNo : $('#memNo').val()
			},
		type: 'post',
		async: false,
		dataType: 'json',
		success: function(rs) {
			if (rs.ErrType != '0') {
				popup("", rs.errorMsg);
				return;
			}
			
			if(rs.memName == ''){
				$("#secStep01").hide();
				popup("", "유효하지 않은 사번입니다." , "closeWindow"); //첫화면으로 이동
				return;
			}
		},
		error: function(error) {
		},
		complete: function() {
			loadingHide();
		}
	});
}

/**
 * 단계진행
 */
function nextStep(step) {
	switch (currStep) {
		case '01': //휴대폰인증화면
			if (step == '00') {
				location.href = 'new-account.jsp'
			} else if (step == 'confirm') {
				moveStep(step);
			} else if (step == '02') {
				if (!isMobiAuth()) return;			// 휴대폰 유효성 검증
				if (!isValid01()) return;			// 01 스텝 유효성 검증
				
				//smsResponse();						// sms인증번호 검증
				startLoading('인증번호를 확인중 입니다.', smsResponse);
				if (!isSmsAuth) return;				// sms인증 완료여부 검증
			}
			break;
		case 'confirm':
			if (step == '00') {
				moveStep('01');
			} else if (step == '02') {
				chkObjConfirm();
			} 
			break;
		case '02':
			sendAirbridgeEventMobileWeb('open an account_1단계', $('#acctTpCode').val());
			
			if (step == '01') {
				$('#btnPrev').attr('onclick', "nextStep('00')");
				moveStep(step);
			} else if (step == 'address01') {
				$('#addrSearchKeyword').val('');	// address01 스텝 주소 검색어 삭제
				$('#address-list li').remove();		// address01 스텝 주소 검색내역 삭제
				
				$('#btnPrev').attr('onclick', "nextStep('" + currStep + "')");
				moveStep(step);
			} else if (step == '03') {
				if (!isValid02()) return;			// 02 스텝 유효성 검증
				
				startLoading('처리 중 입니다.', createAcct);	// 계좌생성
			}
			break;
		case 'address01':
			if (step == '02') {
				$('#btnPrev').attr('onclick', "nextStep('01')");
				moveStep(step);
			} else if (step == 'address02') {
				$('#addrDetailTemp').val('');		// address02 스텝 상세주소 삭제
				
				$('#btnPrev').attr('onclick', "nextStep('" + currStep + "')");
				moveStep(step);
			}
			break;
		case 'address02':
			if (step == 'address01') {
				$('#btnPrev').attr('onclick', "nextStep('02')");
				moveStep(step);
			} else if (step == '02') {
				$('#btnPrev').attr('onclick', "nextStep('01')");
				moveStep(step);
			}
			break;
		default:
	}
}

/**
 * 스텝이동
 */
function moveStep(step) {
	currStep = step;
	
	// 1) popup을 제외한 모든 section hide
	$('section').not('#secPop').hide();
	
	// 2) 해당 section show
	switch (currStep) {
		case '01':
			$('#secStep01').show();
			break;
		case 'confirm':
			$('#secConfirm').show();
			break;
		case '02':
			$('#secStep02').show();
			break;
		case 'address01':
			$('#secAddress01').show();
			break;
		case 'address02':
			$('#secAddress02').show();
			break;
		default:
	}
	
	// 3) 스크롤 상단에 위치
	$(window).scrollTop(0);
	console.log("진입스텝 > " + currStep);
}


function getParam(name){
	var rt = '';
	var nowAddress = unescape(location.href);
	var param = (nowAddress.slice(nowAddress.indexOf('?')+1,nowAddress.length)).split('&');
	
	for(var i=0; i<param.length; i++){
		temp = param[i].split('=');
		if(temp[0] == name){
			rt = temp[1];
		}
	}
	return rt;
}

/**
 * SMS인증1) 인증번호 전송
 */
function smsRequest(element) {
	$(element).text('재인증');
	$('#smsAuthNo').val('');
	
	if ($('#agr_01').prop('checked') == false) {
		popup("", "정보제공 및 약관에 동의해주세요.");
		return false;
	}
	
	if ($('#agr_00').prop('checked') == false) {
		popup("", "개인(신용)정보 처리 동의서(금융거래)에 동의해주세요.");
		return false;
	}
	
	$('#mobiNo').val($("#frstMobiNo option:selected").val() + $("#endMobiNo").val());

	if (!isMobiAuth()) return;
	
	mtk.fillEncData();
	var f_data = serializeData();
	
	loading("인증번호를 발송중입니다.");
	$.ajax({
		url: "../data/common/chkSmsRequest.jsp",
		data: f_data,
		type: 'post',
		dataType: 'json',
		success: function(rsHttp) {
			if (rsHttp) {
				console.dir(rsHttp);
				
				if (rsHttp.ErrType!='0') {
					popup("", rsHttp.errorMsg);
					return;
				}
				
				if (!rsHttp.smsSend) {
					popup("", rsHttp.smsSendMsg);
					return;
				}
				
				// SMS인증 요청 완료
				isSmsRequest = true;
				
				$("#tpCode").val(rsHttp['휴대전화명의인증업체구분코드']);
				$("#seq1").val(rsHttp["순번1"]);
				$("#seq2").val(rsHttp["순번2"]);
				$("#seq3").val(rsHttp["순번3"]);
				
				// 인증번호 발송 후 정보 잠금
				$("#custNm").prop("readonly", true);
				$("#sm1").prop("readonly", true);
				$("#sm2").off("click");
				$("#telcoTpCodeWrap div .option_box").remove();
				$("#frstMobiNoWrap div .option_box").remove();
				$("#endMobiNo").prop("readonly", true);
				
				popup("", "휴대폰으로 SMS 인증번호를 발송하였습니다.\n인증번호 미수신시 고객님 휴대폰의 스팸메시지 확인을 부탁드립니다.");
				$("#smsAuthNo").prop("disabled", false);
				startTimer();
			}
		},
		error: function(error) {
		},
		complete: function() {
			loadingHide();
		}
	});
}

/**
 * SMS인증2) 인증번호 확인
 */
function smsResponse() {
	var f_data = serializeData();

	//loading("처리중입니다.");
	$.ajax({
		url: "../data/common/chkSmsVerify.jsp",
		data: f_data,
		type: 'post',
		async: false,
		dataType: 'json',
		success: function(rs) {
			if (rs.ErrType != '0') {
				popup("", rs.errorMsg);
				return;
			}
			
			stopTimer();
			isSmsAuth = true;
			
			if($('#moaCardYn').val() == 'Y'){
				//20201014 티클모아카드 휴대폰인증 
				//카드발급고객여부확인
				chkPointInvestCard();
			}else if($('#acctTpCode').val() == 'CMA-ISA' || $('#acctTpCode').val() == '4'){
				//20210813 CMA+ISA 계좌개설 
				chkISAHoldYn();
			}else{
				//당사 계좌개설 조건확인
				chkAcctEstLmtYn();
			}
		},
		error: function(error) {
		},
		complete: function() {
			loadingHide();
		}
	});
}

//******************************************************************************
//주소검색
//******************************************************************************
function checkKeyword() {
	var obj = document.form.keyword;
	
	if (obj.value.length > 0) {
		// 특수문자 제거
		var expText = /[%=><]/;
		if (expText.test(obj.value) == true) {
			$('#p_modal_msg').text("특수문자를 입력할 수 없습니다.");
			$('#div_modal_msg').show();
			return false;
		}
		
		// 특정문자열(sql예약어의 앞뒤공백포함)제거
		var sqlArray = new Array("OR","SELECT","INSERT","DELETE","UPDATE","CREATE","DROP","EXEC","UNION","FETCH","DECLARE","TRUNCATE");
		
		var regex;
		var regex_plus;
		for (var i = 0; i < sqlArray.length; i++) {
			//regex = new RegExp("\\s" + sqlArray[i] + "\\s","gi");
			regex = new RegExp(sqlArray[i],"gi");
			if (regex.test(obj.value)) {
				modalNotice("특정문자로 검색할 수 없습니다.");
				return false;
			}
			
			regex_plus = new RegExp("\\+" + sqlArray[i] + "\\+","gi");
			if (regex_plus.test(obj.value)) {
				modalNotice("특정문자로 검색할 수 없습니다.");
				return false;
			}
		}
	}
	
	return true;
}

function getAddr(val1) {
	if (val1 == 0) {
		_arrAddrIndex="";
		_arrAddr = new Array();
		$('#keyword').val($('#addrSearchKeyword').val());
		$('#totalCount').val();
		$('#currentPage').val(1);
		$('#address-list').html(''); //초기화
		
		if (!checkKeyword()) return;
	}

	loading("해당 주소를 검색중입니다.");
	$.ajax({
		url: "../data/common/create-acct-juso.jsp"
		,type: "post"
		,data: $('#form').serialize()
		,dataType: "json"
		,success: function(jsonStr) {
			var errCode = jsonStr.results.common.errorCode;
			var errDesc = jsonStr.results.common.errorMessage;
			
			if (errCode != "0") {
				popup("", "(" + errCode + ") " + errDesc);
				return;
			} else {
				if (jsonStr != null) {
					$('#totalCount').val(jsonStr.results.common.totalCount);
					
					$(jsonStr.results.juso).each(function(idx) {
						if (_arrAddrIndex.length == 0) _arrAddrIndex = 0;
						_arrAddrIndex += 1;
						_arrAddr[_arrAddrIndex] = [this.zipNo, this.roadAddr, this.jibunAddr];
						
						$('#address-list').append(
							$('<li/>').append(
								$('<label/>', {for: "adr_" + _arrAddrIndex}).append(
									$('<a/>', {class: "point_02", onclick: "selectAddrR(" + _arrAddrIndex + ");"}).append(
										$('<span/>', {class: "mb5 c_blue", text: this.zipNo}),
										$('<span/>', {class: "mb5", text: "[도로명]" + this.roadAddr}),
										$('<span/>', {class: "mb5", text: "[지번]" + this.jibunAddr})
									)
								)
							)
						);
					});
					
					if (jsonStr.results.common.totalCount == 0) {
						$('#address-list').html(
							$('<li/>').append(
								$('<label/>').append(
									$('<span/>', {class: "mb5", text: "해당 주소의 검색 결과가 없습니다. 주소가 맞는지 확인하고 다시 검색해주세요."})
								)
							)
						);
					}
				} else {
					$('#address-list').html(
						$('<li/>').append(
							$('<label/>').append(
								$('<span/>', {class: "mb5", text: "해당 주소의 검색 결과가 없습니다. 주소가 맞는지 확인하고 다시 검색해주세요."})
							)
						)
					);
				}
			}
		},
		error: function(xhr, status, error) {
			popup("", "주소정보 조회시 오류가 발생하였습니다.");
		},
		complete: function() {
			loadingHide();
		}
	})
}

function selectAddrR(val1) {
	//address02 영역
	$('#zipNoText').text(_arrAddr[val1][0]);
	$('#roadAddrText').text("[도로명]" + _arrAddr[val1][1]);
	$('#jibunAddrText').text("[지번]" + _arrAddr[val1][2]);
	
	//선택값 변수 임시저장
	zipNoTemp = _arrAddr[val1][0];
	roadAddrTemp = _arrAddr[val1][1];
	
	nextStep('address02');
}

function clearAddr() {
	$('#zip').val('');					// 우편번호
	$('#zipSeq').val('');				// 우편번호순번
	$('#zipAddr').val('');				// 세부주소
}



//******************************************************************************
//금융거래목적확인서 관련
//******************************************************************************
function chkObjConfirm() {
	if ($('#acctEstObjCode option:selected').val() == '6') {
		if ($('#rmk1').val() == '') {
			popup("", "금융거래목적을 입력해주세요.");
			return;
		}
	}
	
	if ($('#yn1').val() == 'Y') {
		popup("", "계좌개설이 불가합니다.");
		return;
	}
	
	if ($('#yn2').val() == 'Y') {
		popup("", "계좌개설이 불가합니다.");
		return;
	}
	
	if ($('#check_01').prop('checked') == false) {
		popup("", "확인서 내용에 동의해주세요.");
		return;
	}
	
	mtk.fillEncData();
	var f_data = $("#form").serialize();
	
	$.ajax({
		url: "../data/common/updateDealObj.jsp",
		data: f_data,
		type: 'post',
		dataType: 'json',
		success: function(rs){
			if(rs.ErrType!='0'){
				popup("", rs.errorMsg);
				return;
			}
			
			updateDealObj = rs.updateDealObj;
			
			//비대면계좌개설 선처리 -> 주소입력화면 이동
			createAcctBefore(function(){
				moveStep('02');
			});
		},
		error: function(error){
			popup("", "금융거래 목적확인서 등록에 실패하셨습니다.");
		},
		complete: function(){
		}
	});
}

//******************************************************************************
//개좌계설관련
//******************************************************************************
/**
 * 당사 계좌개설 조건확인
 */
function chkAcctEstLmtYn() {
	mtk.fillEncData();
	var f_data = serializeData();
	
	console.log('chkAcctEstLmtYn()');
	loading("처리중입니다.");
	$.ajax({
		url: "../data/common/chkInfo.jsp",
		data: f_data,
		type: 'post',
		async: false,
		dataType: 'json',
		success: function(rs) {
			if (rs.ErrType != '0') {
				popup("", rs.errorMsg);
				return;
			}
			if(rs["등록건수"] >= 1) {
				popup("", "금융감독원의 [개인정보노출자 사고예방시스템]<br>에 정보노출자로 등록된 고객으로 조회됩니다.<br>당사 계좌개설이 불가능하오니, 고객님의 개인정보를 확인해주시기 바랍니다.<br><br>※ 문의 : 금융감독원 파인 홈페이지(fine.fss.or.kr)"
						,function(){
					nextStep("00");
				});
				return;
			}
			
			if (rs["점검결과코드"] == '1') {	// 최근 20일 이내에 타 금융기관에서 1개 이상의 계좌가 개설된 내용이 있는 경우 (단기다수)
				if (rs["여부2"] == 'Y') {	// 현 비대면 계좌개설 업무에서 신청중인 내역이 있는 경우 Y
					if(rs["비대면계좌구분코드"] == $('#acctTpCode').val()){ //진행중인 계좌종류와 신규진입 계좌종류가 같은 경우에만 이어가기 진행
						popup("", "중단하신 계좌개설 이력이 있습니다. 계좌개설 이어가기를 하시겠습니까?", "continueStepY", "continueStepNPurpose");
						
						nffAcctEstStepCode = rs["비대면계좌개설단계코드"];
						certNo = rs["비대면임시고객번호"];
						acctTpCode = rs["비대면계좌구분코드"];
						nffRealnmCnfmYn = rs["비대면실명확인여부"];
						bankAcctNo = rs["은행계좌번호"];
					}else{
						continueStepNPurpose();
					}
				} else {
					if (rs.영업일제한여부 == 'Y') {	//properties 설정 값 
						popup("", "고객님은 지난 20일 이내에 금융기관에서 계좌개설 내역이 있어 전자금융사기 예방대책에 따라 계좌개설이 제한됩니다. (영업일 20일 이내 2개 이상 개설제한) 가까운 영업점 또는 고객지원센터 (1588-0365)로 문의바랍니다.");
					} else {
						if($('#acctTpCode').val() == '4'){
							//isa계좌개설의 경우 이체제한X
							nextStep('confirm');
						}else{
							popup("", "‘금융사기예방’ 조치를 위하여 계좌개설일로부터 30일 동안 이체가 제한됩니다.(이체 제한 해제는 영업점에서 가능합니다.)", function(){ nextStep('confirm'); });
						}
					}
				}
				
				return;
			} else if (rs["점검결과코드"] == '2' || rs["점검결과코드"] == '3' || rs["점검결과코드"] == '4') {
				popup("", "고객님은 비대면 계좌개설이 불가합니다. 신한투자증권 고객센터를 통해 문의하여 주시기 바랍니다.\n☎ 1588-0365");
				return;
			} else if (rs.점검결과코드 == 'E') {
				popup("","연합회 정보조회에 실패하였습니다. 잠시 후 다시 시도해주세요.[CODE:" + rs.점검결과코드 + "]");
				return;
			} else {
				if (rs["여부1"] == 'Y') {			// 타 비대면 계좌개설 업무에서 신청중인 내역이 있는 경우 Y
					// popup("", "기존신청정보를 지우고 새로 진행하시겠습니까?", "continueStepN", "returnFunc");
					popup("", "다른 채널에 진행중이던 계좌개설 절차가 완료되지 않았습니다.기존신청정보를 지우고 새로 진행하시겠습니까?", "continueStepN", "closeWindow");
				} else if (rs["여부2"] == 'Y') {	// 현 비대면 계좌개설 업무에서 신청중인 내역이 있는 경우 Y
					if(rs["비대면계좌구분코드"] == $('#acctTpCode').val()){ //진행중인 계좌종류와 신규진입 계좌종류가 같은 경우에만 이어가기 진행
						popup("", "중단하신 계좌개설 이력이 있습니다. 계좌개설 이어가기를 하시겠습니까?", "continueStepY", "continueStepN")
						
						nffAcctEstStepCode = rs["비대면계좌개설단계코드"];
						certNo = rs["비대면임시고객번호"];
						acctTpCode = rs["비대면계좌구분코드"];
						nffRealnmCnfmYn = rs["비대면실명확인여부"];
						bankAcctNo = rs["은행계좌번호"];
					}else{
						continueStepN();
					}
				} else {
					//popup("", "‘금융사기예방’ 조치를 위하여 계좌개설일로부터 7일 동안 1일 100만원까지 타인명의로 출금 가능합니다.(단, 고객님 본인 명의로는 이체 가능)", "continueStepN");
					continueStepN();
				} 
			}
		},
		error: function(error) {
			popup("", "계좌개설 가능여부 조회에 실패하셨습니다.");
		},
		complete: function() {
			loadingHide();
		}
	});
}

function continueStepN() {
	// 비대면 계좌개설 선처리 -> 주소입력 이동
	
	if($('#acctTpCode').val() == '4'){
		//isa계좌개설의 경우 이체제한X
		createAcctBefore(function(){
			moveStep('02');
		});
	}else{
		createAcctBefore(function(){
			$('#btnPrev').attr('onclick', "nextStep('" + currStep + "')");
			popup("", "‘금융사기예방’ 조치를 위하여 계좌개설일로부터 7일 동안 1일 100만원까지 타인명의로 출금 가능합니다.(단, 고객님 본인 명의로는 이체 가능)"
					, function(){ moveStep('02'); });
		});
	}
}
function continueStepNPurpose() { 
	// 비대면 계좌개설 선처리 -> 금융거래목적 확인서 이동
	
	if($('#acctTpCode').val() == '4'){
		//isa계좌개설의 경우 이체제한X
		createAcctBefore(function(){
			nextStep('confirm');
		});
	}else{
		createAcctBefore(function(){
			popup("", "‘금융사기예방’ 조치를 위하여 계좌개설일로부터 30일 동안 이체가 제한됩니다.(이체 제한 해제는 영업점에서 가능합니다.)"
					, function(){ nextStep('confirm'); });
		});
	}
}

function continueStepY() {
	// 영문명 임시저장 -> 이어가기 단계로 이동
	tempDataAdd(function(){
		
		$("#cert_no").val(certNo);
		
		if (nffAcctEstStepCode == '1') {	// 고객정보 등록까지 완료
			// 상담원요청
			var f_data = {
				cert_no: $("#cert_no").val() 
			}
							
			$.ajax({
				type:"POST",
				url:nffaAPI + "/wbk/NF6004.do",
				dataType:'json',
				data:f_data,
				async:false,
				cache:false,
				timeout:600000,
				crossDomain:true,
				success: function (data) {
					if (data.result_cd == "1" || data.result_cd == "2") {
						$('#stepCode').val('07');
						$('#form').attr('action', 'new-account03.jsp').submit();
						return;
					} else if (data.result_cd == "13") {
						if (data.message.includes("요청 가능 횟수가 초과")) {
							popup("", "고객님의 신분증 정보 불일치로 자동 확인 시스템에서 허용한 일 최대 시도 횟수를 초과했습니다. 다음날 다시 시도해주시기 바랍니다.");
						} else {
							popup("", data.message, function(){ $('#stepCode').val('05');$('#form').attr('action', 'new-account03.jsp').submit(); });
						}
					} else {
						$('#stepCode').val('03');
						$('#form').attr('action', 'new-account02.jsp').submit();
						return;
					}
				},
				error: function (e) {
					popup("", "execNF6004 호출에러");
					return;
				}
			});
		} else if (nffAcctEstStepCode == '2' && nffRealnmCnfmYn != 'Y') {		// 신분증 상담원등록 완료
			$('#stepCode').val('07');
			$('#form').attr('action', 'new-account03.jsp').submit();
			return;
		} else if (nffAcctEstStepCode == '2' && nffRealnmCnfmYn == 'Y') {		// 신분증 등록완료
			$('#form').attr('action', 'new-account04.jsp').submit();
			return;
		} else if (nffAcctEstStepCode == '3' && bankAcctNo == '') {				// 신용정보제공 및 계좌비번 등록완료 & 이체 미처리
			$('#form').attr('action', 'new-account04.jsp').submit();
			return;
		} else if ((nffAcctEstStepCode == '3' || nffAcctEstStepCode == '4') && bankAcctNo != '') {				// 신용정보제공 및 계좌비번 등록완료 & 이체 처리 완료
			$('#form').attr('action', 'new-account04.jsp').submit();
			return;
		} else if (nffAcctEstStepCode == '5') {									// 계좌개설 완료
			$('#stepCode').val('13');
			$('#form').attr('action', 'new-account05.jsp').submit();
			return;
		}
	});
}

/**
 * 비대면 계좌개설 선처리
 */
function createAcctBefore(callback) {
	mtk.fillEncData();
	var f_data = serializeData();
	
	loading("처리중 입니다.");
	$.ajax({
		url: "../data/common/create-acct-before.jsp",
		data: f_data,
		type: 'post',
		async: false,
		dataType: 'json',
		success: function(rs) {
			if (rs.ErrType != '0') {
				popup("", rs.errorMsg);
				return;
			}
			
			if(rs.postSeq != ''){
				$('#zip').val(rs.post);
				$('#zipSeq').val(rs.postSeq);
				$('#zipAddr').val(rs.detlAddr);
				
				//화면노출 영역
				$('#zipNo').val(rs.post);
				$('#roadAddr').val(rs.postAddr+" "+rs.detlAddr);
				
				isAddrYn = true;
			}
			
			callback();
		},
		error: function(error) {
			popup("", "등록에 실패하셨습니다.");
		},
		complete: function() {
			loadingHide();
		}
	});
}

/**
 * 계좌 생성
 */
function createAcct() {
	mtk.fillEncData();
	var f_data = serializeData();
	
	loading("처리중 입니다.");
	$.ajax({
		url: "../data/common/create-acct.jsp",
		data: f_data,
		type: 'post',
		async: false,
		dataType: 'json',
		success: function(rs) {
			if (rs.ErrType != '0') {							// 개설 오류
				if (rs.ErrType == '-102') {						// 비번입력 오류
					popup("", rs.errorMsg);
				} else if (rs.ErrType == '-103') {				// 비번불일치
					popup("", "앞서 입력한 4자리의 숫자와 동일한 숫자를 입력해주세요.");
				} else if (rs.errorCode == 'A7355') {			// 개설제한
					popup("","[A7355] 신한투자증권 고객지원센터로 연락주시기 바랍니다. ☎1588-0365");
				} else {
					popup("", rs.errorMsg);
				}
			} else if (rs['정상처리'] == 'Y') {		// 정상처리
				sendAirbridgeEventMobileWeb('open an account_2단계', $('#acctTpCode').val());
				tempDataAdd(function(){
					$('#form').attr('action', 'new-account02.jsp').submit();
				});
			}
			
			return;
		},
		error: function(error) {
			popup("", "등록에 실패하셨습니다.");
		},
		complete: function() {
			loadingHide();
		}
	});
}

/**
 * data 암호화
 */
function serializeData() {
	var f_data = "";
	
	$.each($("#form").serializeArray(), function(i, item){
		f_data += "&" + item.name + "=" + item.value;
	});
	
	console.dir(f_data);
	
	return f_data;
}


//******************************************************************************
//CMA+ISA 계좌개설 관련 함수
//******************************************************************************

/**
 * ISA 계좌보유 여부확인 (당사or타사)
 */
chkISAHoldYn = function(){
	mtk.fillEncData();
	var f_data = serializeData();
	
	$.ajax({
		url: "../data/common/chkISA.jsp",
		data: f_data,
		type: 'post',
		dataType: 'json',
		success: function(rs){
			if(rs.ErrType!='0'){
				popup("", rs.errorMsg);
				return;
			}
			
			if(rs.ISA_yn == "Y"){ 
				//ISA계좌 보유
				if(rs.ISA_shinhan_yn == 'Y'){
					//당사보유
					popup("알림", "<p class=\"fwb c_blue\">당사에 ISA계좌가<br>이미 있으시군요.</p><p class=\"pt10 fz13\">ISA 계좌는1개만 개설 가능하므로<br>CMA계좌로 개설됩니다.</p>"
							,function(){
								//CMA 계좌개설
								$('#acctTpCode').val('3'); 
								chkAcctEstLmtYn();
								$('#btnConfirm').text("확인"); //공통 팝업 "확인" TEXT로 변경
							});
					$('#btnConfirm').text("CMA 계좌 개설하기");
				}else{
					//타사보유
					popup("알림",	"<p class=\"fwb c_blue\">타사에 ISA계좌를<br>이미 보유하고 있어요.</p>" +
									"<p class=\"pt10 fz13 ls-05\">"+
										"고객님께서는 타사에 ISA 계좌를 보유 중이므로<br>계좌개설 후 ISA계좌 이동이 가능합니다.<br>(계좌개설 완료 후 알파 App을 통해<br>ISA 계좌이동신청이 가능합니다)"+
									"</p>"
							,function(){
								//CMA+증권종합 계좌개설
								chkAcctEstLmtYn();
								$('#btnConfirm').text("확인"); //공통 팝업 "확인" TEXT로 변경
							});
					$('#btnConfirm').text("다음");
				}
			}else{
				//ISA계좌 미보유
				chkAcctEstLmtYn(); //CMA+ISA 계좌개설
			}
			
		},
		error: function(error){
			popup("", "ISA 계좌보유여부 확인에 실패하셨습니다.");
		},
		complete: function(){
		}
	});
}

//******************************************************************************
//유효성 검증
//******************************************************************************
/**
 * 유효성 검증 : 이메일
 */
function isEmail(s) {
	return /^([0-9a-zA-Z]+)([0-9a-zA-Z\._-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,3}$/.test(s);
}

/**
 * 유효성 검증 : 휴대폰
 */
function isMobiAuth() {
	if ($("#custNm").val().trim().length == 0) {
		popup("", "이름을 입력해주세요.");
		return false;
	}
	
	if($('#engnm1').is(':visible')){
		if ($("#engnm1").val().trim().length == 0) {
			popup("", "영문성을 입력해주세요.");
			return false;
		}else if ($("#engnm2").val().trim().length == 0) {
			popup("", "영문이름을 입력해주세요.");
			return false;
		}else if ($("#engnm1").val().trim().length + $("#engnm2").val().trim().length > 21 ) {
			popup("", "영문명의 글자수를 확인해주세요.");
			return false;
		}
	}
	
	if ($("#sm1").val().length != 6 || $("#sm2").val().length != 7) {
		popup("", "주민번호를 확인해 주세요.");
		return false;
	}
	
	if ($("#telcoTpCode option:selected").val() == '') {
		popup("", "통신사를 선택해주세요.");
		return false;
	}
	
	if ($("#endMobiNo").val().length < 7) {
		popup("", "휴대폰 번호를 확인해 주세요.");
		return false;
	}
	
	return true;
}

/**
 * 유효성 검증 : step01
 */
function isValid01() {
	if (isSmsRequest == false) {
		popup("", "휴대폰 본인인증 인증요청을 진행해 주세요.");
		return false;
	}
	
	if ($('#agr_01').prop('checked') == false) {
		popup("", "정보제공 및 약관에 동의해주세요.");
		return false;
	}
	
	if ($('#agr_00').prop('checked') == false) {
		popup("", "개인정보 수집·이용에 동의해주세요.");
		return false;
	}
	
	if (time <= 0) {
		popup("", "인증시간이 지났습니다.\n\n인증번호를 재전송해주세요.");
		return false;
	}
	
	if ($("#smsAuthNo").val().length != 6) {
		popup("", "인증번호를 정확하게 입력해주세요.");
		$("#smsAuthNo").focus();
		return false;
	}
	
	return true;
}

/**
 * 유효성 검증 : step02
 */
function isValid02() {
	if ($("#roadAddr").val() == "") {
		popup("", "주소 검색을 해주세요.");
		return false;
	}
	
	if (!isEmail($("#email").val())) {
		popup("", "이메일을 형식에 맞게 입력해주세요.");
		return false;
	}
	
	if ($("#dealObj").val() == "") {
		popup("", "거래목적을 입력해주세요.");
		return false;
	}
	
	if ($("#orgnSource").val() == "") {
		popup("", "자금원천을 입력해주세요.");
		return false;
	}
	
	if ($("#realOwner").val() == "N") {
		popup("", "자금 실소유자가 아닐경우 계좌개설이 불가합니다.");
		return false;
	}
	
	if ($("#occIndcDtlCode").val() == "") {
		popup("", "직업을 입력해주세요.");
		return false;
	}

	if ($("input[name=tax_radio]:checked").val() == 'N'){
    	popup("", "다른 나라에서 세금을 내고 계신 경우,<br> 비대면 계좌개설을 할 수 없어요.<br> 가까운 영업점을 방문해 주세요.");
    	return false;
	}
	return true;
}

//******************************************************************************
//SMS인증 타이머 관련
//******************************************************************************
var timer;
var limit = 60 * 3; //제한시간
var time = -1000;

/**
 * 타이머 설정
 */
function setTimer() {
	if (time < 0) {
		clearTimer();
	} else {
		$("#authTimer").text(setMMSS(time--));
		timer = setTimeout("setTimer()", 1000);
	}
}

/**
 * 타이머 시작
 */
function startTimer() {
	clearTimer();
	time = limit;
	$("#authTimer").text("");
	setTimer();
}

/**
 * 타이머 멈춤
 */
function stopTimer() {
	clearTimer();
	time = -1000;
	$("#authTimer").text("");
}

/**
 * 타이머 삭제
 */
function clearTimer() {
	clearTimeout(timer);
}

/**
 * 시간설정
 */
function setMMSS(sec) {
	var min = parseInt(sec / 60, 10);
	var sec = sec % 60;
	var tmp = "["
	
	if(min > 0) tmp += (min + ":");
	tmp += (sec + "]");
	
	return tmp;
}

//******************************************************************************
//타이머 관련
//******************************************************************************
/**
 * transkey polling
 */
function transkeyPoll() {
	setTimeout(function() {
		$.ajax({
			url : "../data/common/transkey-se.jsp",
			complete : transkeyPoll
		})
	}, 30000)
}

//******************************************************************************
//복합상품 티클모아카드 관련 함수
//******************************************************************************
/**
 * 티클모아카드 발급여부 확인
 */
function chkPointInvestCard(){
	loading("처리중 입니다.");
	$.ajax({
		url: "../data/common/chkPointInvestCard.jsp",
		data: '',
		type: 'post',
		async: false,
		dataType: 'json',
		success: function(rs) {
			if (rs.ErrType != '0') {
				popup("", rs.errorMsg);
				return;
			}
			
			if(rs.발급여부 == 'Y'){
				//티클모아카드 보유
				if(rs.acctYn == 'N'){
					//금투계좌 미보유 -> 계좌개설 진행
					/*
						popupBtnTxt("투자계좌 미보유" 
								, '지금 투자계좌를 만드시면,<br />'+rs.웰컴금액+'원 상당의 USD 달러를 웰컴으로 드려요!'
								, '2만원 받고 티클모아 투자하기'
								, function(){ chkAcctEstLmtYn(); }  //당사 계좌개설 조건확인
							);
					*/
					chkAcctEstLmtYn();
				}else if(rs.acctYn == 'Y'){
					//금투계좌 보유 -> 투자계좌 선택화면으로 이동
					
					//acctCnt : 투자가능계좌리스트개수
					if(rs.acctCnt > 0){
						if(rs.acctNo == ''){
							//소수점 투자계좌 미보유
							popupBtnTxt("투자계좌 미선택" 
									, '투자계좌를 선택하셔야 투자(적립)포인트가 입금될 수 있습니다.'
									, '투자계좌 선택하기'
									//, '투자계좌선택하고 5천원받기' 2021.1.10일 이후 적용
									, function(){ goPointInvestAcctSelect(); }  //당사 계좌개설 조건확인
							);
						}else{
							//소수점 투자계좌 보유
							popupBtnTxt("투자계좌 선택완료" 
									, '투자계좌가 이미 있으시네요!<br /> 투자(적립)포인트가 입금될 계좌를 확인하세요'
									, '투자계좌 확인하기'
									//, '투자계좌선택하고 5천원받기' 2021.1.10일 이후 적용
									, function(){ goPointInvestAcctSelect(); }  //해외주식소수점투자 이용계좌 선택화면
							);
						}
					}else{
						//금투 투자가능계좌 계좌 미보유 -> 계좌개설 진행
						/*
						 	//2021.1.10일 이후 적용
							popupBtnTxt("투자계좌 미보유" 
								, '지금 투자계좌를 만드시면,<br />'+rs.웰컴금액+'원 상당의 USD 달러를 웰컴으로 드려요!'
								, '2만원 받고 티클모아 투자하기'
								, function(){ chkAcctEstLmtYn(); }  //당사 계좌개설 조건확인
							);
						*/
						chkAcctEstLmtYn();
					}
				}
			}else if(rs.발급여부 == 'N'){
				//티클모아카드 미보유
				popupBtnTxt("더모아(신한금투)카드 미보유" 
						, "고객님은 더모아(신한금투)카드<br />" +
								"발급 이력이 없습니다.<br />" +  
						  "카드 신청 후 영업일기준<br />" +
						  "1~3일 정도 소요됩니다.<br />" +
						  "자세한 사항은 신한투자증권<br />" +
						  " 고객지원센터에 문의하세요."
						, '확인'
						, '1588-0365'
						, function(){ location.href='../themore/invest-main.jsp'; }
						, function(){ location.href='tel:15880365' }
				)
			} else {
				popup("", rs.errorMsg);
				return;
			}
			
		},
		error: function(error) {
			popup("", "카드 발급여부 확인에 실패하셨습니다.");
		},
		complete: function() {
			loadingHide();
		}
	});
}

/**
 * 해외주식소수점투자 이용계좌 선택화면으로 이동
 */
function goPointInvestAcctSelect(){
	location.href = '../themore/invest-account.jsp';
}


function getReturnValue(param){
	$('input[id^=agr_00]').prop('checked', true);
}
