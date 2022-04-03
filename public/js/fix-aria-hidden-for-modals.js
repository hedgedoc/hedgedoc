$(document).on('shown.bs.modal', function (event) {
  $(event.target).attr('aria-hidden', 'false')
}).on('hidden.bs.modal', function (event) {
  $(event.target).attr('aria-hidden', 'true')
})
