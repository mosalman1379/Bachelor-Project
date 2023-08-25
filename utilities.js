const jalali = require('jalaali-js');

function saveGeorgian(string){
    let arr = string.split("/");
    for(let i=0;i<arr.length;i+=1){
        arr[i]=parseInt(arr[i]);
    }
    const DateExtracted = jalali.toGregorian(arr[2],arr[0],arr[1]);
    return new Date(DateExtracted.gy,DateExtracted.gm,DateExtracted.gd,12,0,0);
}
function getCookie(req, key) {
    let cookies = {};

    const cookiesArray = req.headers.cookie.split(';');

    cookiesArray.forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        cookies[key] = value;
    });

    return cookies[key];
}

module.exports.getCookie = getCookie;
module.exports.saveGeorgian = saveGeorgian;
