/*!
 * IguanaExplorer helpers
 * info: various reusable functions go here
 */

var helperProto = function() {};

helperProto.prototype.convertUnixTime = function(UNIX_timestamp, format) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours();
  var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
  var sec = a.getSeconds();

  if (format === 'DDMMMYYYY')
    return date + ' ' + month + ' ' + year + ' ';
  if (format === 'HHMM')
    return hour + ':' + min;
}

helperProto.prototype.reindexAssocArray = function(array) {
  var _array = [], index = 0;

  $.each(array, function(key, value) {
    if (value) {
      _array[index] = value;
      index++;
    }
  });

  return _array;
}

helperProto.prototype.toggleModalWindow = function(formClassName, timeout) {
  var modalWindow = $("." + formClassName);

  if (modalWindow.hasClass("fade")) {
    modalWindow.removeClass("hidden");
    setTimeout(function() {
      modalWindow.removeClass("fade");
    }, 10);
  } else {
    modalWindow.addClass("fade");
    setTimeout(function() {
      modalWindow.addClass("hidden");
    }, timeout);
  }
}