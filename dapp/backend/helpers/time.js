const dateToShortDateTime = (date) => {

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
  
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
  
    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  }
  
const getDateTimestamp = (date) => Math.round(date / 1000);
  
const getTimestampDate = (timestamp) => dateToShortDateTime(new Date(Number(timestamp) * 1000));

// Fonction pour créer une pause
const delay = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

module.exports = { dateToShortDateTime, getDateTimestamp, getTimestampDate, delay };