dt = new Date()
create_date = dt.getFullYear()+'-'+dt.getMonth()+'-'+dt.getDate()+'T'+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds()+'+03:00'
data_json = JSON.stringify({
    "amount": Math.floor(Math.random()*10000),
    "createDate": create_date,
    "currency": "RUB",
    "order": "STINGER" + Math.floor(Math.random()*10000).toString(),
    "qrType": "QRDynamic",
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
    }).then(response => { return response.json()
    })
}
/*function goToQR(img)
{
	url = "qr-code.html?image="+img
	document.location.href = url;
}*/
/*sendRequest('POST', url_raif, data_json)
    .then(data => {
        console.log(data)
        //alert(data["qrUrl"])
    })
    .catch(err => console.log(err));*/
//let image = document.querySelector('.img')
//function getImage(){return image}
function changeImage(img){
    document.querySelector('.img').src = img
}

