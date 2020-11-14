data_json = JSON.stringify({
    "additionalInfo": "Доп информация",
    "amount": 10,
    "createDate": "2020-11-15T09:14:38.107227+03:00",
    "currency": "RUB",
    "order": "1-22-333",
    "paymentDetails": "Назначение платежа",
    "qrType": "QRStatic",
    "qrExpirationDate": "2022-11-15T09:14:38.107227+03:00",
    "sbpMerchantId": "MA749377"
  })
const url_raif = 'https://test.ecom.raiffeisen.ru/api/sbp/v1/qr/register';
//const url_raif = 'https://e-commerce.raiffeisen.ru/api/sbp/v1/qr/register'
function sendRequest(method, url, body=null) {
    headers = {
        'Content-Type':'application/json'
    }
    return fetch(url,{
        method: method,
        body: body,
        headers: headers
    }).then(response => {return response
    })
}
sendRequest('POST', url_raif, data_json)
    .then(data => console.log(data))
    .catch(err => console.log(err))

