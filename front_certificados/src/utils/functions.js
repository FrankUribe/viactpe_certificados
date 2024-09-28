export const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0');
}
export const formatDateDesde = (date = new Date()) => {
  return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      '01',
  ].join('-');
}

export const formatDateHasta = (date = new Date()) => {
  return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
  ].join('-');
}

export const objToXML = (obj) => {
  var xml = ''
  for (skey in obj) {
      switch (typeof obj[skey]) {
          case 'object':
              var skey = skey
              xml += `<` + skey + `>\n`
              xml += objToXML(obj[skey])
              xml += `</` + skey + `>\n`
              break;
          default:
              if (obj[skey] == '') {
                  xml += `<` + skey + `/>\n`
              } else {
                  xml += `<` + skey + `>` + obj[skey] + `</` + skey + `>\n`
              }
              break;
      }
  }
  return xml
}

export const formatNumberMMD = (number) => {
  const parts = number.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1] : '';
  const formattedInteger = integerPart.replace(/\B(?=(\d{6})+(?!\d))/g, "'");
  const formattedInteger2 = formattedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedInteger2 + decimalPart;
}

export const setCookie = (name, value, days) => {
  const now = new Date();
  // Crear una nueva fecha para la medianoche del día siguiente
  const midnightTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const timeUntilMidnight = midnightTomorrow.getTime() - now.getTime();

  const expires = "expires=" + midnightTomorrow.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
export const cookieExists = (name) => {
  return getCookie(name) !== null;
}
export const eraseCookie = (name) => {   
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';  
}