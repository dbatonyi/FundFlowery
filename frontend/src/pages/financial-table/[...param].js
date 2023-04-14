import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { AuthContext } from "../../layouts/Layout";
const configData = require("../../../config");

const FinancialTable = () => {
  const router = useRouter();
  const urlParam = router.query.param;

  const { setStatusMessage, userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchFinancialTable = async () => {
      try {
        const response = await fetch(
          `${configData.serverUrl}/api/get-financial-table-data`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authenticate: `Bearer ${configData.apiToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
              tableUuid: urlParam,
            }),
          }
        );
        const dataJson = await response.json();

        if (response.status === 200) {
          console.log(dataJson.data);
        }
      } catch (error) {
        const log = await fetch(`${configData.serverUrl}/api/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            log: error,
          }),
        });
        const data = await log.json();
        setStatusMessage(data.message);
      }
    };

    fetchFinancialTable();
  }, []);

  return (
    <div className="financial-table">
      <div className="financial-table__form-container">
        Table data goes here
      </div>
    </div>
  );
};

export default FinancialTable;
