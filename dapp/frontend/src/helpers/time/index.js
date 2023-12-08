export const dateToShortDateTime = (date) => {

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

export const dateToShortDate = (date) => {

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  return day + '/' + month + '/' + year;
}
  
export const getDateTimestamp = (date) => Math.round(date / 1000);
  
export const getTimestampDate = (timestamp) => dateToShortDateTime(new Date(Number(timestamp) * 1000));

export const getTimestampShortDate = (timestamp) => dateToShortDate(new Date(Number(timestamp) * 1000));

export function formatTimeSpan(startTime, endTime) {

  let difference = endTime - startTime;

  let hours = Math.floor(difference / 3600000);
  let minutes = Math.floor((difference % 3600000) / 60000);
  let seconds = Math.floor((difference % 60000) / 1000);

  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}