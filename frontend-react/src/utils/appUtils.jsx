const serverURL = "http://localhost:5001";

const getInitials = (name) => {
  const nameArray = name.split(" ");
  if (nameArray.length === 1) {
    return nameArray[0].slice(0, 2).toUpperCase();
  } else {
    const initials = nameArray[0].charAt(0) + nameArray[1].charAt(0);
    return initials.toUpperCase();
  }
};

export { serverURL, getInitials };
