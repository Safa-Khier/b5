import React from "react";
import { useTranslation } from "react-i18next";
import { removeTrailingZeros } from "../../../../public/publicFunctions";

export const HoldingCoinsRow = (prop) => {
  const crypto = prop.data;
  const currency = prop.currency;
  const { t } = useTranslation();

  const amount = () => {
    return (
      <div className="flex flex-col text-md font-semibold">
        {removeTrailingZeros(crypto.amount.toFixed(10))}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {"$ " +
            removeTrailingZeros(
              (crypto.amount * crypto.current_price).toFixed(10),
            )}
        </span>
      </div>
    );
  };

  function createChangeElement(change) {
    const changeNegative = change < 0;
    change = changeNegative ? change * -1 : change;

    //stat_minus_1
    return (
      <div
        className={`flex justify-end items-center ${changeNegative ? "text-red-500" : "text-green-500"}`}
      >
        <i className="material-icons w-3">
          {changeNegative ? "expand_more" : "expand_less"}
        </i>
        <div className="ml-3">{change.toFixed(2)}</div>
      </div>
    );
  }

  return (
    <tr className="border-b hover:bg-gray-200 dark:hover:bg-gray-900 font-semibold">
      <td className="py-2 text-start">
        <div className="flex justify-start h-[100%] items-center">
          <img
            className="w-6 h-6 mr-2"
            loading="lazy"
            src={crypto.image}
            alt={crypto.name + " Logo"}
          />
          <div className="flex flex-col justify-center items-start">
            {crypto.symbol.toUpperCase()}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {crypto.name}
            </span>
          </div>
        </div>
      </td>
      <td className="py-2 text-end">{amount()}</td>
      <td className="py-2 md:table-cell hidden text-end">
        {"$ " + crypto.current_price.toLocaleString()}
      </td>
      <td className="py-2 md:table-cell hidden text-end">
        {createChangeElement(currency.price_change_percentage_24h_in_currency)}
      </td>
      <td className="py-2 md:table-cell hidden text-end">
        <button
          onClick={() => console.log("Trade")}
          className="underline text-custom-teal"
        >
          {t("trade")}
        </button>
      </td>
      <td className="py-2 md:hidden table-cell text-end">
        <button className="material-icons">more_vert</button>
      </td>
    </tr>
  );
};

export default HoldingCoinsRow;
