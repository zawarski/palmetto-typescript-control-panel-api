export const convertColsToFilterSQL = (filters = {}, columns: string[], prefix = '') => {
  let filter = '';
  // Below code is to get dataset based on filters provided
  if (filters) {
    for (let key in filters) {
      let values = filters[key];
      if (key === 'search') {
        filter += filter.trim().length === 0 ? '(' : ' AND ';
        filter += '(';
        values = Array.isArray(values) ? values : [values];
        values.forEach((value, index) => {
          columns.forEach((column, columnIndex) => {
            if (value === 'null') {
              filter += ' ' + (prefix ? prefix + '.' : '') + column + ' IS NULL';
            } else {
              filter += ' ' + (prefix ? prefix + '.' : '') + column + " LIKE '%" + value + "%'";
            }
            if (columnIndex + 1 < columns.length) {
              filter += ' OR ';
            }
          });
          filter += index < values.length - 1 ? ') AND (' : ')';
        });
      } else if (key === 'date') {
        const dates = values.toString().split(',');
        if (dates && dates.length === 4) {
          let minCreateField = dates[0];
          if (prefix) {
            minCreateField = prefix + '.' + minCreateField;
          }
          const minCreateDate = new Date(parseInt(dates[1])).toISOString();
          let maxCreateField = dates[2];
          if (prefix) {
            maxCreateField = prefix + '.' + maxCreateField;
          }
          const maxCreateDate = new Date(parseInt(dates[3])).toISOString();
          filter += filter.trim().length === 0 ? ' (' : ' AND ';
          filter +=
            ' (' +
            minCreateField +
            " >= '" +
            minCreateDate +
            "' AND " +
            maxCreateField +
            " <= '" +
            maxCreateDate +
            "') ";
        }
      } else {
        if (prefix) {
          key = prefix + '.' + key;
        }
        filter += filter.trim().length === 0 ? '(' : ' AND ';
        values = !Array.isArray(values) ? (values.indexOf(',') !== -1 ? values.split(',') : [values]) : values;
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (value === 'null') {
            filter += (i === 0 ? '(' : i < values.length ? ' OR ' : '') + '' + key + ' IS NULL';
          } else {
            // filter += (i === 0 ? "(" : i < values.length ? " OR " : "") + '' + key + " LIKE '%" + value + "%'";
            filter += (i === 0 ? '(' : i < values.length ? ' OR ' : '') + '' + key + " ='" + value + "'";
          }
        }
        filter += ')';
      }
    }
    filter += filter.trim().length > 0 ? ')' : '';
  }
  return filter;
};

export const convertColsToOrderSQL = (orders = {}, prefix: string) => {
  let orders_sql = '';
  if (orders) {
    for (let key in orders) {
      let values = orders[key];
      values = Array.isArray(values) ? values : [values];
      key = prefix ? '`' + prefix + '`.`' + key + '`' : key;
      orders_sql += (orders_sql.length ? ', ' : '') + key + ' ' + values[0];
    }
  }
  orders_sql = orders_sql.length ? ' ORDER BY ' + orders_sql + ' ' : ' ';
  return orders_sql;
};

export function findWordInBrackets(inputString: string) {
  const regex = /\[(.*?)]/; // Regular expression to match text between square brackets
  const match = regex.exec(inputString);

  if (match && match[1]) {
    return match[1]; // The matched word between square brackets
  } else {
    return null; // No match found
  }
}

export const convertColumnsToSelectString = (columns: Record<string, string>): string => {
  const keys = Object.keys(columns);
  const formattedKeys = keys.map((key) => `a.${key}`);
  return `SELECT ${formattedKeys.join(', ')}`;
};
