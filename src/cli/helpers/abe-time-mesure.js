import clc from 'cli-color'

export default class TimeMesure {

  constructor(str) {
    this._name = str
    console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
    if(typeof str !== 'undefined' && str !== null) {
      console.log('start: ' + clc.green(str))
    }
    this._dateStart = new Date()
  }

  _msToTime(duration) {
      var milliseconds = parseInt((duration%1000)/100)
          , seconds = parseInt((duration/1000)%60)
          , minutes = parseInt((duration/(1000*60))%60)
          , hours = parseInt((duration/(1000*60*60))%24);

      hours = (hours < 10) ? "0" + hours : hours;
      minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;

      return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }

  /**
   * Get all input from a template
   * @return {Array} array of input form
   */
  duration(str) {
    var d = new Date(new Date().getTime() - this._dateStart.getTime()).getTime()
    console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
    console.log('d', d)
    console.log((this._name ? 'end ' + this._name : "") + "(" + clc.green(this._msToTime(d)) + ") " + (str ? str : ""))
  }
}