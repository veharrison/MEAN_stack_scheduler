$('#slide-activater').on('click', function(){
	var window_height = $(window).height();
	$('.right-slider').animate({width:'20vw'},500).toggle(500,function (){
		$('.right-slider').css('display:block,position:absolute');
	})
});
	
