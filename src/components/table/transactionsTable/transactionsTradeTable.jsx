import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TransactionsTradeRow } from "./transactionsTradeRow";

export default function TransactionsTradeTable({ transactions, currencies }) {
  const { t } = useTranslation();
  const transactionsPerPage = 7;

  const [transactionsData, setTransactionsData] = useState([]);
  const [data, setData] = useState([]);
  const [sort, setSort] = useState({ field: "", asc: null });
  const [currentPage, setCurrentPage] = useState(1);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [length, setLength] = useState(5);

  useEffect(() => {
    updateTransactionsData();
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function updateTransactionsData() {
    const transactionsFullData = transactions
      .filter((transaction) => transaction.transactionType === "trade") // Only include "trade" transactions
      .map((transaction) => {
        const soldCurrency = currencies.find(
          (currency) => currency.id === transaction.soldCurrency.id,
        );
        const boughtCurrency = currencies.find(
          (currency) => currency.id === transaction.boughtCurrency.id,
        );

        return {
          ...transaction,
          soldCurrency: {
            ...transaction.soldCurrency,
            name: soldCurrency.name,
            symbol: soldCurrency.symbol,
            image: soldCurrency.image,
          },
          boughtCurrency: {
            ...transaction.boughtCurrency,
            name: boughtCurrency.name,
            symbol: boughtCurrency.symbol,
            image: boughtCurrency.image,
          },
        };
      });

    transactionsFullData.sort(
      (a, b) => b.timestamp.toDate() - a.timestamp.toDate(),
    );

    setTransactionsData(transactionsFullData);
    handlePageChange();
  }

  useEffect(() => {
    // Check if the window width is less than 768px, adjust length accordingly
    if (windowWidth < 768) {
      setLength(3); // For mobile devices
    } else {
      setLength(5); // For desktop
    }
  }, [windowWidth]);

  useEffect(() => {
    if (Math.ceil(data.length / transactionsPerPage) < currentPage) {
      setCurrentPage(1);
    }
    handlePageChange();
  }, [transactionsData]);

  const totalPageNumber = () => {
    return Math.ceil(transactionsData.length / transactionsPerPage);
  };

  useEffect(() => {
    handlePageChange();
  }, [currentPage]);

  function sortData(field, subField = null) {
    if (sort.field === field || sort.field === field + "." + subField) {
      if (sort.asc === false) {
        setData(
          data.sort((a, b) => {
            if (
              typeof a[field] === "number" ||
              typeof a[field][subField] === "number"
            ) {
              if (subField) {
                return b[field][subField] - a[field][subField];
              }
              return b[field] - a[field];
            } else {
              if (subField) {
                return ("" + b[field][subField]).localeCompare(
                  a[field][subField],
                );
              }
              return ("" + b[field]).localeCompare(a[field]);
            }
          }),
        );
        if (subField) {
          setSort({ field: field + "." + subField, asc: true });
          return;
        }
        setSort({ field, asc: true });
        return;
      }
      handlePageChange();
      setSort({ field: "", asc: null });
      return;
    }
    setData(
      data.sort((a, b) => {
        if (
          typeof a[field] === "number" ||
          typeof a[field][subField] === "number"
        ) {
          if (subField) {
            return a[field][subField] - b[field][subField];
          }
          return a[field] - b[field];
        } else {
          if (subField) {
            return ("" + a[field][subField]).localeCompare(b[field][subField]);
          }
          return ("" + a[field]).localeCompare(b[field]);
        }
      }),
    );
    if (subField) {
      setSort({ field: field + "." + subField, asc: false });
      return;
    }
    setSort({ field, asc: false });
  }

  const headerCell = (field, title) => {
    return (
      <div
        className={`flex py-2 ${title === "toCurrency" || title === "fromCurrency" ? "justify-start" : "justify-end"} items-center`}
      >
        {t(title)}
        {checkIfSortedBy(field) ? (
          <i className="material-icons">
            {sort.asc ? "expand_less" : "expand_more"}
          </i>
        ) : null}
      </div>
    );
  };

  function checkIfSortedBy(field) {
    return sort.field === field;
  }

  function nextPage() {
    if (currentPage === totalPageNumber()) {
      return;
    }
    setCurrentPage(currentPage + 1);
  }

  function previousPage() {
    if (currentPage === 1) {
      return;
    }
    setCurrentPage(currentPage - 1);
  }

  function goToPage(page) {
    setCurrentPage(page);
  }

  function handlePageChange() {
    setData(
      transactionsData.slice(
        (currentPage - 1) * transactionsPerPage,
        currentPage * transactionsPerPage,
      ),
    );
  }

  return (
    <div>
      <table className="w-full h-full">
        <thead>
          <tr className="border-b">
            <th
              onClick={() => sortData("soldCurrency", "name")}
              className="cursor-pointer bg-white dark:bg-gray-800 "
            >
              {headerCell("soldCurrency.name", "fromCurrency")}
            </th>

            <th
              onClick={() => sortData("boughtCurrency", "name")}
              className="cursor-pointer bg-white dark:bg-gray-800 "
            >
              {headerCell("boughtCurrency.name", "toCurrency")}
            </th>
            <th
              onClick={() => sortData("soldCurrency", "amount")}
              className="cursor-pointer bg-white dark:bg-gray-800 md:table-cell hidden"
            >
              {headerCell("soldCurrency.amount", "quantitySold")}
            </th>
            <th
              onClick={() => sortData("boughtCurrency", "amount")}
              className="cursor-pointer bg-white dark:bg-gray-800 md:table-cell hidden"
            >
              {headerCell("boughtCurrency.amount", "quantityBought")}
            </th>
            <th
              onClick={() => sortData("timestamp")}
              className="cursor-pointer bg-white dark:bg-gray-800 md:table-cell hidden"
            >
              {headerCell("timestamp", "time")}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, index) => (
            <TransactionsTradeRow
              data={d}
              key={d.id}
              index={index + 1 + (currentPage - 1) * transactionsPerPage}
              header={false}
            />
          ))}
        </tbody>
      </table>

      {totalPageNumber() > 1 && (
        <div className="flex justify-end items-center mt-2">
          <button
            onClick={previousPage}
            className="material-icons w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:hover:bg-transparent disabled:dark:hover:bg-transparent"
            disabled={currentPage === 1}
          >
            navigate_before
          </button>
          <button
            onClick={() => goToPage(1)}
            className={`w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          >
            1
          </button>
          {currentPage > 3 ? (
            <p className="w-8 h-8 m-px grid text-center items-center">...</p>
          ) : null}
          {Array.from(
            { length },
            (_, i) => currentPage + i - (length === 5 ? 2 : 1),
          ).map((number) => {
            if (number > 1 && number < totalPageNumber()) {
              return (
                <button
                  key={`pageButton-${number}`}
                  onClick={() => goToPage(number)}
                  className={`w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600  rounded-md ${currentPage === number ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                >
                  {number}
                </button>
              );
            }
          })}
          {currentPage < totalPageNumber() - (length === 5 ? 3 : 2) ? (
            <p className="w-8 h-8 m-px grid text-center items-center">...</p>
          ) : null}
          <button
            onClick={() => goToPage(totalPageNumber())}
            className={`w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md ${currentPage === totalPageNumber() ? "bg-gray-200 dark:bg-gray-700" : ""}`}
          >
            {totalPageNumber()}
          </button>
          <button
            onClick={nextPage}
            className="material-icons w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:hover:bg-transparent disabled:dark:hover:bg-transparent"
            disabled={totalPageNumber() === currentPage}
          >
            navigate_next
          </button>
        </div>
      )}
    </div>
  );
}
