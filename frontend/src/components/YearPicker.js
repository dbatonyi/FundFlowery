import React from "react";

const YearPicker = ({ startYear, endYear, selectedYear, onYearChange }) => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  const handleChange = (event) => {
    const selectedYear = event.target.value;
    onYearChange(selectedYear);
  };

  return (
    <select value={selectedYear} onChange={handleChange}>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};

export default YearPicker;
