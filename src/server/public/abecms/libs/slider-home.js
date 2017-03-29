var tweets = twitterFetcher.fetch({
  "profile": {"screenName": 'abe_cms'},
  "domId": 'tweets-slider',
  "maxTweets": 10,
  "enableLinks": true, 
  "showUser": true,
  "showTime": true,
  "showImages": false,
  "lang": 'en',
  "showRetweet": false,
  "customCallback": function (tweets) {
  	var x = tweets.length;
    var n = 0;
    var element = document.getElementById('tweets-slider');
    var html = '<div class="swiper-wrapper">';
    while(n < x) {
      html += '<div class="swiper-slide">' +
			      		tweets[n]
			      			.replace(/>Posted on /, '>')
			      			.replace(/<p class=\"interact\">(.*)/, '') +
			      	'</div>';
      n++;
    }
    html += '</div><div class="swiper-pagination"></div>';
    element.innerHTML = html;

		var swiper = new Swiper('.swiper-container', {
		  pagination: '.swiper-pagination',
		  slidesPerView: 3,
		  paginationClickable: true
		});
  }
})
