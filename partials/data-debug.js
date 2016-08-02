jQuery('.collapse').collapse();

jQuery( document ).ready(function() {
	 jQuery('.btn-danger').on('click', function (e) {
	 	 e.preventDefault()

	 	 jQuery.ajax({
   			url: $(this).attr('data-url')
   		})
	 })
})