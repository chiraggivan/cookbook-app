// ---------------------------- format date and time received from backend to look human friendly -----------------
const formattedDate = (val) => {
  const dishDate = new Date(val);
  const day = dishDate.getDate();
  const todayDate = new Date();
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);

  if (
    dishDate.getDate() === todayDate.getDate() &&
    dishDate.getMonth() === todayDate.getMonth() &&
    dishDate.getFullYear() === todayDate.getFullYear()
  ) {
    return "Today";
  } else if (
    dishDate.getDate() === yesterdayDate.getDate() &&
    dishDate.getMonth() === yesterdayDate.getMonth() &&
    dishDate.getFullYear() === yesterdayDate.getFullYear()
  ) {
    formattedDate;
    return "Yesterday";
  } else {
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";

    return `${day}${suffix} ${dishDate.toLocaleString("en-GB", { month: "short" })} ${String(dishDate.getFullYear()).slice(-2)}`;
  }
};

export default formattedDate;
