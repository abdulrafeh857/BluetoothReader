const sendDataApi = async () => {
  console.log("\n\n\n sendDataApi");

  var myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "token 8876033992dbda4e9c99b77b2c582311db6b34f3148fc1ca51e826cc11932989"
  );
  myHeaders.append(
    "Cookie",
    "csrftoken=gJ9F1u9MdWVazNM2qBIbxGNEEDvKc2Jvlqydv8gpr1Hoylk3CWW16LAGgnPnNkfA"
  );

  var formdata = new FormData();
  formdata.append("id", "2548");
  formdata.append("reg", "BL66PNK");
  formdata.append("fare", "20");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  fetch(
    "http://dev-api.iclerk.io/invoice/api/public/meter-invoice/invoice/",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      console.log("\n\n\n RES API === ", result);
    })
    .catch((error) => console.log("\n\n\n RES API error === ", error));
};
export default sendDataApi;
