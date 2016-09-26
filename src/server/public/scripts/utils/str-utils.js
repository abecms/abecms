
export default class StrUtils {

  constructor() {}

  static escapeRegExp(str) {
    var specials = [
      // order matters for these
        "-"
      , "["
      , "]"
      // order doesn't matter for any of these
      , "/"
      , "{"
      , "}"
      , "("
      , ")"
      , "*"
      , "+"
      , "?"
      , "."
      , "\\"
      , "^"
      , "$"
      , "|"
      ]

    // I choose to escape every character with '\'
    // even though only some strictly require it when inside of []
    , regex = RegExp("[" + specials.join("\\") + "]", "g")
    return str.replace(regex, "\\$&")
  }

}