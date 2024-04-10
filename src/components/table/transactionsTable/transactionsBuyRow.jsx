import React from "react";
import { removeTrailingZeros } from "../../../../public/publicFunctions";
import { useTranslation } from "react-i18next";

export const TransactionsBuyRow = (prop) => {
  const transaction = prop.data;
  const { t } = useTranslation();

  function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1; // getMonth() returns month from 0 to 11
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Pad single digits with leading zeros
    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }

  const amountCell = () => {
    return (
      <div className="flex flex-col justify-center items-end">
        <div>
          {parseFloat(transaction.amount.toFixed(5)).toLocaleString() +
            " " +
            transaction.symbol.toUpperCase()}
        </div>
        <div className="font-semibold text-sm text-gray-500 dark:text-gray-400">
          {"$" +
            parseFloat(removeTrailingZeros(transaction.price)).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <tr className="border-b hover:bg-gray-200 dark:hover:bg-gray-900 font-bold">
      <td className="py-2">
        <div className="flex justify-start h-[100%] items-center">
          <img
            className="w-6 h-6 mr-2"
            loading="lazy"
            src={transaction.image}
            alt={transaction.name + " Logo"}
          />
          <div className="flex flex-col justify-center items-start">
            {transaction.symbol.toUpperCase()}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {transaction.name}
            </span>
          </div>
        </div>
      </td>
      {/* <td className="py-2 text-end md:table-cell hidden">
        {"$" +
          parseFloat(removeTrailingZeros(transaction.price)).toLocaleString()}
      </td> */}
      <td className="py-2 text-end">
        {/* {transaction.amount} */}
        {amountCell()}
      </td>
      <td className="py-2 md:table-cell hidden text-end">
        {transaction.creditCardDetails.cardNumber}
      </td>
      <td className="py-2 text-end">
        {formatDate(transaction.timestamp.toDate())}
      </td>
    </tr>
  );
};

export default TransactionsBuyRow;
