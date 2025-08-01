const moment = require("moment");
const { daysOfWeek, months } = require("./datetime");

// ----------------------------------------------------------------------

function fDayofWeek(day) {
  const dayOfWeek = daysOfWeek[day];
  return dayOfWeek;
}

function fWeekOfMonth(weekIndex) {
  const weeks = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
  return weeks[weekIndex - 1];
}

function fDate(date, newFormat) {
  const format = newFormat || "MMM Do YY h:mm a";

  return date ? moment(date).format(format) : "";
}

function fDateTimeDay(date, newFormat) {
  const dayOfWeek = daysOfWeek[new Date(date).getDay()];

  const format = newFormat || "MMM Do YY h:mm a";

  return date ? moment(date).format(format) + " " + dayOfWeek : "";
}

module.exports = {
  fDayofWeek,
  fWeekOfMonth,
  fDate,
  fDateTimeDay,
};
