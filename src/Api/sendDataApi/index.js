const sendDataApi = async () => {
  console.log('\n\n\n sendDataApi');
 
  var requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };
  console.log('\n\n\n requestOptions', requestOptions);
  fetch(
    'https://iclerk-backend-dev.herokuapp.com/payment/api/stripe/reader/get-token/?tenant_uid=4130a539-143c-4224-b78c-d6b0a436759a',
    requestOptions,
  )
    .then(response => response.json())
    .then(result => console.log('\n\n\n RES API === ', result))
    .catch(error => console.log('\n\n\n  error API', error, error.status));
};
export default sendDataApi;
