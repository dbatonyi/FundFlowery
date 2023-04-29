import React from "react";

const CurrencyRatesTable = ({ currencyRates }) => {
  const date = new Date(currencyRates[0].createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

  return (
    <div className="currency-table">
      <div className="currency-table--title">
        <h3>Currency rates</h3>
      </div>
      <div className="currency-table--updated-at">
        Last updated at: {formattedDateTime}
      </div>
      <div className="currency-table__list">
        {currencyRates.map((currency, index) => {
          return (
            <div className="currency-table__list--card" key={index}>
              <div className="currency-title">
                {currency?.currencyExchangeBase}-
                {currency?.currencyExchangeTarget}
              </div>
              <div className="currency-rate">
                {currency.currencyExchangeRate}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrencyRatesTable;
