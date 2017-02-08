/*global document, top, $, location, confirm, alert */
import Nanoajax from 'nanoajax'
import qs from 'qs'
import {Promise} from 'bluebird'
import extend from 'extend'
import on from 'on'

export default class TaskRepublish {
  constructor() {
    this._ajax = Nanoajax.ajax

    // this.remove = on(this)

    // event handlers
    this._handleBtnGeneratePostsClick = this._btnGeneratePostsClick.bind(this)
    this._btnGeneratePosts = document.querySelector('[data-generate-posts]')

    this.rebind()
  }

  rebind() {
    if(typeof this._btnGeneratePosts !== 'undefined' && this._btnGeneratePosts !== null) {
      this._btnGeneratePosts.removeEventListener('click', this._handleBtnGeneratePostsClick)
      this._btnGeneratePosts.addEventListener('click', this._handleBtnGeneratePostsClick)

      // don't watch if btn source not present
      if (!!window.EventSource) {
        var source = new EventSource('/abe/generate-posts');
        source.addEventListener('message', (e, data) => {
          var json = JSON.parse(e.data)
          if (json.percent != null && json.time != null) {
            this._btnGeneratePosts.classList.add('disabled')
            this._btnGeneratePosts.querySelector('[data-not-clicked]').className = 'hidden'
            this._btnGeneratePosts.querySelector('[data-clicked]').className = ''
            this._btnGeneratePosts.querySelector('[data-clicked]').innerHTML = `publish site... ${json.percent}% (${json.time})`
          }else if (json.msg != "") {
            this._btnGeneratePosts.classList.remove('disabled')
            this._btnGeneratePosts.querySelector('[data-not-clicked]').className = ''
            this._btnGeneratePosts.querySelector('[data-clicked]').className = 'hidden'
          }
        }, false);

        source.addEventListener('open', (e) => {
          // Connection was opened.
        }, false);

        source.addEventListener('error', (e) => {
          if (e.readyState == EventSource.CLOSED) {
            // Connection was closed.
          }
        }, false);

      } else {
        // Result to xhr polling :(
      }
    }
  }

  _btnGeneratePostsClick(e) {
    e.preventDefault()
    // this._btnGeneratePosts.querySelector('[data-not-clicked]').className = 'hidden'
    // this._btnGeneratePosts.querySelector('[data-clicked]').className = ''
    this._ajax(
      {
        url: document.location.origin + '/abe/generate-posts',
        method: 'get',
        headers: {
          'Accept':'application/json'
        }
      },
      (e, responseText) => {
        var response = JSON.parse(responseText)
        if (response.success !== 1) {
          alert(response.msg)
        }
      }
    )
  }
}	