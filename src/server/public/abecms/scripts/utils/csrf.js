export function getCsrfToken() {
  const input = document.querySelector('#globalCsrfToken')
  return input ? input.value : ''
}

export function getCsrfHeaders() {
  const token = getCsrfToken()
  return token ? {'X-CSRF-Token': token} : {}
}
