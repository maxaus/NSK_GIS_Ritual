const wreck  = require('@hapi/wreck');
const moment = require('moment');

const DATE_FORMAT = 'YYYY-MM-DD';


function enumerateDaysBetweenDates (startDate, endDate) {
  let now = startDate.clone(), dates = [];

  while (now.isSameOrBefore(endDate)) {
    dates.push(now.clone());
    now.add(1, 'days');
  }
  return dates;
}

async function getData (start, end) {
  const { payload } = await wreck.get(`https://map.novo-sibirsk.ru/arcgis/rest/services/GIS_Ritual/MapServer/0/query?f=json&callback=jQuery1101003225880106877854_1593434810565&returnIdsOnly=false&returnCountOnly=false&returnGeometry=true&returnZ=true&outSR=4326&where=((DeathDate+BETWEEN
+%27${start}+05%3A00%3A00%27+AND+%27${end}+04%3A59%3A59%27))&orderByFields=DeceasedName+ASC%2CCemeteryName+DESC&outFields=*&_=1593434810569`, { gunzip: 'force' });

  const strWithJQuery = payload.toString('utf-8');
  const clearStr      = strWithJQuery.substring(strWithJQuery.indexOf('{'), strWithJQuery.length - 2)

  return JSON.parse(clearStr);
}

async function fetchForPeriod (startDate, endDate) {


  const days = enumerateDaysBetweenDates(moment(startDate, DATE_FORMAT), moment(endDate, DATE_FORMAT));
  let sum    = 0;
  for (const day of days) {
    const start = day.clone().subtract(1, 'days').format(DATE_FORMAT)
    const end   = day.format(DATE_FORMAT)

    const response = await getData(start, end);
    const count    = response.features.length;

    console.log(`На ${end} найдено ${count}`);
    sum += count;
  }

  console.log(`Всего за период с ${startDate} по ${endDate} найдено ${sum}`);
}


const args = process.argv.slice(2);
fetchForPeriod(args[0], args[1]);