const getWeek = function (date) {
  var currentDate = new Date(date);

  // Calculate the starting and ending dates of the current week
  var firstDay = new Date(
    currentDate.setDate(currentDate.getDate() - currentDate.getDay())
  );
  var lastDay = new Date(
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
  );

  // Calculate the week index
  var weekIndex = Math.ceil(
    (lastDay - new Date(firstDay.getFullYear(), 0, 1)) /
      (7 * 24 * 60 * 60 * 1000)
  );

  return weekIndex;
};

const toDateString = (currentFinalDateTime) => {
  const now = new Date();
  if (currentFinalDateTime === null) {
    return "";
  }
  currentFinalDateTime = new Date(currentFinalDateTime);

  if (currentFinalDateTime.getFullYear() < now.getFullYear() - 1) {
    return "Before Last Year";
  } else if (currentFinalDateTime.getFullYear() === now.getFullYear() - 1) {
    return "Last Year";
  } else if (currentFinalDateTime.getFullYear() === now.getFullYear() + 1) {
    return "Next Year";
  } else if (currentFinalDateTime.getFullYear() > now.getFullYear() + 1) {
    return "After Next Year";
  } else if (currentFinalDateTime.getMonth() === now.getMonth() - 1) {
    return "Last Month";
  } else if (
    Math.ceil(currentFinalDateTime.getMonth() / 3) ===
    Math.ceil(now.getMonth() / 3) - 1
  ) {
    return "Last Quarter";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() === now.getDate() - 1
  ) {
    return "Yesterday";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() === now.getDate() + 1 &&
    currentFinalDateTime.getHours() < 12
  ) {
    return "Tomorrow morning";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() === now.getDate() + 1 &&
    currentFinalDateTime.getHours() < 18
  ) {
    return "Tomorrow afternoon";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() === now.getDate() + 1 &&
    currentFinalDateTime.getHours() >= 18
  ) {
    return "Tomorrow evening";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() === now.getDate() &&
    currentFinalDateTime < now
  ) {
    return "Earlier Today";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() === now.getDate() &&
    currentFinalDateTime.getHours() >= 18 &&
    currentFinalDateTime > now
  ) {
    return "Tonight";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() === now.getDate()
  ) {
    return "Today";
  } else if (
    getWeek(currentFinalDateTime) === getWeek(now) &&
    currentFinalDateTime.getDay() === 0 &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "Sunday";
  } else if (
    getWeek(currentFinalDateTime) === getWeek(now) &&
    currentFinalDateTime.getDay() === 1 &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "Monday";
  } else if (
    getWeek(currentFinalDateTime) === getWeek(now) &&
    currentFinalDateTime.getDay() === 2 &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "Tuesday";
  } else if (
    getWeek(currentFinalDateTime) === getWeek(now) &&
    currentFinalDateTime.getDay() === 3 &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "Wednesday";
  } else if (
    getWeek(currentFinalDateTime) === getWeek(now) &&
    currentFinalDateTime.getDay() === 4 &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "Thursday";
  } else if (
    getWeek(currentFinalDateTime) === getWeek(now) &&
    currentFinalDateTime.getDay() === 5 &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "Friday";
  } else if (
    getWeek(currentFinalDateTime) === getWeek(now) &&
    currentFinalDateTime.getDay() === 6 &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "Saturday";
  } else if (getWeek(currentFinalDateTime) === getWeek(now) - 1) {
    return "Last Week";
  } else if (getWeek(currentFinalDateTime) === getWeek(now)) {
    return "This Week";
  } else if (getWeek(currentFinalDateTime) === getWeek(now) + 1) {
    return "Next Week";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "This Month";
  } else if (
    currentFinalDateTime.getMonth() === now.getMonth() &&
    currentFinalDateTime.getDate() > now.getDate()
  ) {
    return "This Month";
  } else if (currentFinalDateTime.getMonth() === now.getMonth() + 1) {
    return "Next Month";
  } else if (
    currentFinalDateTime.getMonth() > now.getMonth() &&
    currentFinalDateTime.getMonth() === 5
  ) {
    return "June";
  } else if (
    currentFinalDateTime.getMonth() > now.getMonth() &&
    currentFinalDateTime.getMonth() === 6
  ) {
    return "July";
  } else if (
    currentFinalDateTime.getMonth() > now.getMonth() &&
    currentFinalDateTime.getMonth() === 7
  ) {
    return "August";
  } else if (
    currentFinalDateTime.getMonth() > now.getMonth() &&
    currentFinalDateTime.getMonth() === 8
  ) {
    return "September";
  } else if (
    currentFinalDateTime.getMonth() > now.getMonth() &&
    currentFinalDateTime.getMonth() === 9
  ) {
    return "October";
  } else if (
    currentFinalDateTime.getMonth() > now.getMonth() &&
    currentFinalDateTime.getMonth() === 10
  ) {
    return "November";
  } else if (
    currentFinalDateTime.getMonth() > now.getMonth() &&
    currentFinalDateTime.getMonth() === 11
  ) {
    return "December";
  } else if (
    Math.ceil(currentFinalDateTime.getMonth() / 3) ===
    Math.ceil(now.getMonth() / 3)
  ) {
    return "This Quarter";
  } else if (currentFinalDateTime.getFullYear() === now.getFullYear()) {
    return "This Year";
  } else {
    return "";
  }
};

module.exports = {
  toDateString,
};
