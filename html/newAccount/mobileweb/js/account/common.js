//계좌개설 시스템 점검  공통 팝업 
function checkOpen(idcheck){
	try {
		$.ajax({
			url: "/common/account/data/checkOpen.jsp",
			dataType: 'json',
			success:function(rs){
				if (rs.openYN == 'N') {
					popup("시스템 점검 안내",rs.message, function(){
						location.href='new-account.jsp';
						return;
					});
				} else if (rs.idYN == "N" && idcheck == true) {
					popup("주민등록증 확인 시스템 점검 안내",rs.idMessage);
				}
			},
			error: function(e) {
			},
			complete:function(statusText,status) {
			}
		});
	} catch(e) {};
}

/**
 * 
 * @param category 계좌개설단계
 * @param acctTpCode 1:S-Lite, 2:증권종합계좌, 3:CMA, 4:중개형ISA
 * @author 174166 
 * @returns
 */
function sendAirbridgeEventMobileWeb(category, acctTpCode, callback) {
	  let action = 'CMA';
	  switch (acctTpCode) {
	    case "1": action = 'S-Lite+'; break;
	    case "2": action = '증권종합'; break;
	    case "3": action = 'CMA'; break;
	    case "4": action = '중개형ISA'; break;
	    default:
	      break;
	  }
	  console.log('Send AirBridge Event' + category + ' ' + action);
	  return sendAirbridgeAsyncEvent(category, action, 3000, callback);
}

