import axios from "axios";

// delete button function
export async function HandleDishDelete({ id, token, navigate }) {
  const deleteurl = `http://localhost:5001/dish/api/delete/${id}`;

  try {
    const res = await axios.delete(deleteurl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res?.data?.success === true) {
      alert(res?.data?.message);
      navigate(`/myDishes?changed=true&id=${id}`);
      console.log(res?.data?.message);
      return;
    } else {
      alert(res?.data?.message);
      console.log(res?.data?.message);
      return;
    }
  } catch (err) {
    throw err;
    return;
  }
}
