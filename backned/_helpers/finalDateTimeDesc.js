const getEndOfFollowingDay = (createdAt, index = 0) => {
  const date = new Date(createdAt.getTime() + 3600 * 24 * 1000 * index);

  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  const value = `${formattedDate} 5:00:00 PM`;
  return value;
};

const getEndOfWeek = (createdAt) => {
  const date = new Date(
    createdAt.getTime() +
      7 * 24 * 60 * 60 * 1000 -
      (createdAt.getDay() + 7 - 5) * 24 * 60 * 60 * 1000
  );
  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  const value = `${formattedDate} 5:00:00 PM`;
  return value;
};

const getEndOfMonth = (createdAt, index = 0) => {
  const firstDayOfNextMonth = new Date(
    createdAt.getFullYear(),
    createdAt.getMonth() + 1 + index,
    1
  );
  const lastDayOfCurrentMonth = new Date(firstDayOfNextMonth.getTime() - 1);
  const formattedDate = `${
    lastDayOfCurrentMonth.getMonth() + 1
  }/${lastDayOfCurrentMonth.getDate()}/${lastDayOfCurrentMonth.getFullYear()}`;
  const value = `${formattedDate} 5:00:00 PM`;
  return value;
};

const getQuarterDate = (createdAt, index = 0) => {
  const currentMonth = createdAt.getMonth();
  const targetMonth = currentMonth + (3 - (currentMonth % 3)) + index;

  const lastDayOfNextMonth = new Date(createdAt.getFullYear(), targetMonth, 0);
  const formattedDate = `${
    lastDayOfNextMonth.getMonth() + 1
  }/${lastDayOfNextMonth.getDate()}/${lastDayOfNextMonth.getFullYear()}`;
  const value = `${formattedDate} 5:00:00 PM`;

  return value;
};

const finalDateTimeDesc = (createdAt, priorityScore = "") => {
  let finalDate = "";

  let result = "";
  switch (priorityScore) {
    case "16":
      finalDate = new Date(
        Math.ceil(Date.parse(createdAt) / (60 * 60 * 1000)) * (60 * 60 * 1000)
      );
      break;
    case "15":
      finalDate = new Date(Math.ceil(Date.parse(createdAt) + 3600 * 1000));
      break;
    case "14":
      finalDate = new Date(getEndOfFollowingDay(createdAt, 0));
      break;
    case "13":
      finalDate = new Date(getEndOfFollowingDay(createdAt, 1));
      break;
    case "12":
      finalDate = new Date(getEndOfFollowingDay(createdAt, 2));
      break;
    case "11":
      finalDate = getEndOfWeek(createdAt);
      break;
    case "10":
      result = new Date(getEndOfWeek(createdAt));
      result.setHours(result.getHours() + 7 * 24);
      finalDate = result;
      break;
    case "9 ":
      result = new Date(getEndOfWeek(createdAt));
      result.setHours(result.getHours() + 14 * 24);
      finalDate = result;
      break;
    case "8 ":
      finalDate = new Date(getEndOfMonth(createdAt));
      break;
    case "7 ":
      finalDate = new Date(getEndOfMonth(createdAt, 1));
      break;
    case "6 ":
      finalDate = new Date(getEndOfMonth(createdAt, 2));
      break;
    case "5 ":
      finalDate = new Date(getQuarterDate(createdAt));
      break;
    case "4 ":
      finalDate = new Date(getQuarterDate(createdAt, 3));
      break;
    case "3 ":
      finalDate = new Date(getQuarterDate(createdAt, 6));
      break;
    case "2 ":
      finalDate = new Date(createdAt.getFullYear(), 11, 31);
      break;
    case "1 ":
      finalDate = new Date(createdAt.getFullYear() + 1, 11, 31);
      break;
    default:
      finalDate = null;
  }

  return finalDate;
};

module.exports = {
  finalDateTimeDesc,
};
