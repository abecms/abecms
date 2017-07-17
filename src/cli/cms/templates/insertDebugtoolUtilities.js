export default function insertDebugtoolUtilities(text, onlyHTML) {
  if (onlyHTML) {
    text = `{{&setVariable "abeEditor" false}}\n${text}`
  } else {
    text = `{{&setVariable "abeEditor" true}}\n${text}`
    text = text.replace(
      /<\/body>/,
      `<style>
          body [data-abe]{ transition: box-shadow 600ms ease-in-out; box-shadow: 0; }
          body .select-border{ border-color: #007CDE; box-shadow: 0 3px 13px #7CBAEF; }
          body img.display-attr:before { content: attr(alt); }
          body a.display-attr:before { content: attr(title); }
          body .display-attr:before { position: absolute; display: block; z-index: 555; font-size: 10px; background-color: rgba(255, 255, 255, 0.75); padding: 2px 5px; color: #5D5D5D; }
          .hidden-abe{ display: none!important; width: 0px !important; height: 0px!important; position: absolute; left: -10000px; top: -10000px; visibility: hidden;}
        </style>
      </body>`
    )
  }
  return text
}
