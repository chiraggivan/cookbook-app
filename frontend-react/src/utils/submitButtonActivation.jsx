import { useState } from "react";

function OnDataChange(data1, data2) {
  const json1 = JSON.stringify(data1);
  const json2 = JSON.stringify(data2);

  if (json1 === json2) {
    return true;
  } else {
    return false;
  }
}

export default OnDataChange;
