const sendDataApi = async (event) => {
  console.log("\n\n\n sendDataApi === ",event);

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "token 8876033992dbda4e9c99b77b2c582311db6b34f3148fc1ca51e826cc11932989"
  );
  myHeaders.append("tenant", "4130a539143c4224b78cd6b0a436759a");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    amount: 4,
    description: "TESTING",
    taxi_data: {
      ref_id: "1",
      reg_number: "3",
    },
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(
    "https://iclerk-backend-dev.herokuapp.com/invoice/api/public/paylink/",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      console.log("\n\n\n RES API === ", result);
    })
    .catch((error) => console.log("\n\n\n RES API error === ", error));
};
export default sendDataApi;
