function CodeTextarea(wrapper) {
  this.focused = false
  this.wrapper = wrapper
  this.textarea = wrapper.querySelector('.form-code')
  this.displayData = wrapper.querySelector('.form-code-display')
  this.delay = null;
  
  this.textEditor = CodeMirror.fromTextArea(this.textarea, {
    lineNumbers: true,
    keyMap: "sublime",
    styleActiveLine: true,
    matchBrackets: true,
    mode: this.textarea.getAttribute('data-code-mode'),
    tabSize: 2,
    viewportMargin: Infinity,
    theme: this.textarea.getAttribute('data-code-theme')
  });

  this.textEditor.on("change", function() {
    clearTimeout(this.delay); 
    this.delay = setTimeout(() => {this.setHTML()}, 300)
  }.bind(this));

  this.textEditor.on("focus", function() {
    this.focused = true
    this.dispatchFocus()
  }.bind(this));

  this.textEditor.on("blur", function() {
    if (this.focused){
      this.focused = false
      this.dispatchBlur()
    }
  }.bind(this));

  setTimeout(() => {this.dispatchFocus();this.setHTML()}, 300)

  this.dispatchFocus = function() {
    var evt = document.createEvent('KeyboardEvent')
    evt.initKeyboardEvent('focus', true, true, window, 0, 0, 0, 0, 0, 'e'.charCodeAt(0))
    switch(this.textarea.getAttribute('data-code-mode')) {
      case 'text/html':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/css':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/javascript':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/x-scss':
        this.displayData.dispatchEvent(evt)
        break;
      case 'text/x-less':
        this.displayData.dispatchEvent(evt)
        break;
      default:
        this.textarea.dispatchEvent(evt)
    }
  }

  this.dispatchBlur = function() {
    var evt = document.createEvent('KeyboardEvent')
    evt.initKeyboardEvent('blur', true, true, window, 0, 0, 0, 0, 0, 'e'.charCodeAt(0))
    switch(this.textarea.getAttribute('data-code-mode')) {
      case 'text/html':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/css':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/javascript':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/x-scss':
        this.displayData.dispatchEvent(evt)
        break;
      case 'text/x-less':
        this.displayData.dispatchEvent(evt)
        break;
      default:
        this.textarea.dispatchEvent(evt)
    }
  }

  this.setHTML = function() {
    this.textarea.innerHTML = this.textEditor.getValue()
    var evt = document.createEvent('KeyboardEvent')
    evt.initKeyboardEvent('keyup', true, true, window, 0, 0, 0, 0, 0, 'e'.charCodeAt(0))
    switch(this.textarea.getAttribute('data-code-mode')) {
      case 'text/html':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/css':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/javascript':
        this.textarea.dispatchEvent(evt)
        break;
      case 'text/x-scss':
        var scss = this.textEditor.getValue()
        sass.compile(scss, function(result) {
          this.displayData.innerHTML = result.text
          this.displayData.dispatchEvent(evt)
        }.bind(this));
        break;
      case 'text/x-less':
        var lessCode = this.textEditor.getValue()
        try {
          less.render(lessCode, function(error, result){
            if(error == null){
              this.displayData.innerHTML = result.css
              this.displayData.dispatchEvent(evt)
            }
          }.bind(this));
        } catch (error) {
          console.log(error)
        }
        break;
      default:
        this.textarea.dispatchEvent(evt)
    }
  }
}
// export default class CodeTextarea {

//   constructor(wrapper) {
//     this.focused = false
//     this.wrapper = wrapper
//     this.textarea = wrapper.querySelector('.form-code')
//     this.displayData = wrapper.querySelector('.form-code-display')
//     this.delay = null;

//     this.textEditor = CodeMirror.fromTextArea(this.textarea, {
//         lineNumbers: true,
//         keyMap: "sublime",
//         styleActiveLine: true,
//         matchBrackets: true,
//         mode: this.textarea.getAttribute('data-code-mode'),
//         tabSize: 2,
//         viewportMargin: Infinity,
//         theme: this.textarea.getAttribute('data-code-theme')
//     });

//     this.textEditor.on("change", function() {
//       clearTimeout(this.delay); 
//       this.delay = setTimeout(() => {this.setHTML()}, 300)
//     }.bind(this));

//     this.textEditor.on("focus", function() {
//       this.focused = true
//       this.dispatchFocus()
//     }.bind(this));

//     this.textEditor.on("blur", function() {
//       if (this.focused){
//         this.focused = false
//         this.dispatchBlur()
//       }
//     }.bind(this));

//     setTimeout(() => {this.dispatchFocus();this.setHTML()}, 300)
//   }

//   dispatchFocus() {
//     var evt = document.createEvent('KeyboardEvent')
//     evt.initKeyboardEvent('focus', true, true, window, 0, 0, 0, 0, 0, 'e'.charCodeAt(0))
//     switch(this.textarea.getAttribute('data-code-mode')) {
//       case 'text/html':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/css':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/javascript':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/x-scss':
//         this.displayData.dispatchEvent(evt)
//         break;
//       case 'text/x-less':
//         this.displayData.dispatchEvent(evt)
//         break;
//       default:
//         this.textarea.dispatchEvent(evt)
//     }
//   }

//   dispatchBlur() {
//     var evt = document.createEvent('KeyboardEvent')
//     evt.initKeyboardEvent('blur', true, true, window, 0, 0, 0, 0, 0, 'e'.charCodeAt(0))
//     switch(this.textarea.getAttribute('data-code-mode')) {
//       case 'text/html':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/css':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/javascript':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/x-scss':
//         this.displayData.dispatchEvent(evt)
//         break;
//       case 'text/x-less':
//         this.displayData.dispatchEvent(evt)
//         break;
//       default:
//         this.textarea.dispatchEvent(evt)
//     }
//   }

//   setHTML() {
//     this.textarea.innerHTML = this.textEditor.getValue()
//     var evt = document.createEvent('KeyboardEvent')
//     evt.initKeyboardEvent('keyup', true, true, window, 0, 0, 0, 0, 0, 'e'.charCodeAt(0))
//     switch(this.textarea.getAttribute('data-code-mode')) {
//       case 'text/html':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/css':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/javascript':
//         this.textarea.dispatchEvent(evt)
//         break;
//       case 'text/x-scss':
//         var scss = this.textEditor.getValue()
//         sass.compile(scss, function(result) {
//           this.displayData.innerHTML = result.text
//           this.displayData.dispatchEvent(evt)
//         }.bind(this));
//         break;
//       case 'text/x-less':
//         var lessCode = this.textEditor.getValue()
//         try {
//           less.render(lessCode, function(error, result){
//             if(error == null){
//               this.displayData.innerHTML = result.css
//               this.displayData.dispatchEvent(evt)
//             }
//           }.bind(this));
//         } catch (error) {
//           console.log(error)
//         }
//         break;
//       default:
//         this.textarea.dispatchEvent(evt)
//     }
//   }
// }
