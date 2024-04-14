import React, { useEffect, useState } from "react";
import Footer from "../../../../footer";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { mcokCurrencies } from "../../../../../../public/mockData.jsx";
import { useAuth } from "../../../../../AuthContext.js";
import { withdrawCrypto } from "../../../../../firebase.js";
import Alert from "../../../../alert/alert.jsx";

export default function Withdraw() {
  const { t } = useTranslation();
  const { currentUserData } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState();
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState("");
  const [bankAccountDetails, setBankAccountDetails] = useState({
    accountNumber: "",
    branchNumber: "",
    bankNumber: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const showAlert = () => setAlertVisible(true);
  const hideAlert = () => setAlertVisible(false);
  const [alertData, setAlertData] = useState({
    title: "",
    message: "",
    messageType: "",
    action: () => {},
  });

  useEffect(() => {
    const walletCurrencies = currentUserData.wallet.map((walletCurrency) => {
      const currency = mcokCurrencies.find(
        (currency) => currency.id === walletCurrency.id,
      );
      return {
        ...currency,
        ...walletCurrency,
        label: currency.name,
      };
    });
    setCurrencies(walletCurrencies);
  }, []);

  // Custom option component
  const CustomOption = ({ innerProps, isFocused, isSelected, data }) => (
    <div
      {...innerProps}
      className={`text-sm flex justify-between items-center p-2 ${isFocused && "bg-gray-300 dark:bg-gray-600"} ${isSelected && "font-bold text-custom-teal"}`}
    >
      <div className="flex justify-start h-[100%] items-center">
        <img
          className="w-6 h-6 mr-2"
          loading="lazy"
          src={data.image}
          alt={data.label + " Logo"}
        />
        <div className="flex flex-col justify-center items-start">
          {data.symbol.toUpperCase()}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {data.label}
          </span>
        </div>
      </div>
      {isSelected && <i className="material-icons">done</i>}
    </div>
  );

  const SelectValue = ({ data }) => (
    <div className="flex items-center">
      <img src={data.image} style={{ width: 20, height: 20, marginRight: 8 }} />
      {data.symbol.toUpperCase() + " (" + data.label + ")"}
    </div>
  );

  const handleAmountChange = (e) => {
    // Get the raw input value
    let value = e.target.value;

    if (value === ".") {
      value = "0.";
    }

    // Remove leading zeros and non-numeric chars except for the first decimal point
    value = value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
      // If there are multiple dots, keep only the first part and the second part separated by a dot
      value = parts[0] + "." + parts.slice(1).join("");
    }

    // If the value is an empty string or only a dot, update the state accordingly and exit
    if (value === "" || value === ".") {
      setAmount(value);
      return;
    }

    // Check if there is a selected spendCurrency
    if (!selectedCurrency) return "";

    // Find the maxAmount for the selected currency
    const maxAmount = maxWithdrawAmount();

    // If the input value exceeds maxAmount, ignore it
    const numericValue = parseFloat(value);
    if (numericValue > maxAmount) {
      return;
    }

    // Update the state with the cleaned-up, yet unformatted value, to preserve input behavior
    setAmount(value);
  };

  const maxWithdrawAmount = () => {
    if (!selectedCurrency) return 0;
    const maxAmount =
      currentUserData.wallet.find(
        (currency) => selectedCurrency.id === currency.id,
      )?.amount || 0;
    return maxAmount;
  };

  const amountMessage = () => {
    if (!selectedCurrency) return "Select a currency to withdraw First...";
    const maxAmount = maxWithdrawAmount();
    return `(${t("max")}: ${maxAmount} ${selectedCurrency.symbol.toUpperCase()})`;
  };

  const amountInputPlaceholder = () => {
    if (!selectedCurrency) return t("selectCurrencyFirst");
    return `${t("enterAmount")} (${t("forExample")} ${maxWithdrawAmount().toFixed(10)} ${selectedCurrency.symbol.toUpperCase()})`;
  };

  const handleAccountNumberChange = (e) => {
    // Get the raw input value
    let value = e.target.value;

    // Remove leading zeros and non-numeric chars and non-"/"
    value = value.replace(/[^0-9/]/g, "");

    // Update the state with the cleaned-up value
    setBankAccountDetails({
      ...bankAccountDetails,
      accountNumber: value,
    });
  };

  const validateInputs = () => {
    if (!selectedCurrency) {
      alert("error", "errorSelectCurrencyToWithdraw");
      return false;
    }
    if (!amount) {
      alert("error", "errorEnterAmountToWithdraw");
      return false;
    }
    if (!bankAccountDetails.accountNumber) {
      alert("error", "errorEnterYourAccountNumber");
      return false;
    }
    if (!bankAccountDetails.branchNumber) {
      alert("error", "errorEnterYourBranchNumber");
      return false;
    }
    if (!bankAccountDetails.bankNumber) {
      alert("error", "errorEnterYourBankNumber");
      return false;
    }
    return true;
  };

  const alert = (title, message, messageType, action) => {
    setAlertData({
      title: title,
      message: message,
      messageType: messageType,
      action: action,
    });
    showAlert();
  };

  const handleWithdraw = async () => {
    if (!validateInputs()) return;

    // Withdraw the amount
    try {
      setIsLoading(true);
      let accountBalance = 0;

      if (!selectedCurrency) return;
      currentUserData.wallet.forEach((currency) => {
        const currencyPrice = currencies.find(
          (c) => c.id === currency.id,
        ).current_price;
        accountBalance += currency.amount * currencyPrice;
      });

      accountBalance -= selectedCurrency.current_price * amount;

      await withdrawCrypto(
        currentUserData,
        selectedCurrency,
        parseFloat(amount),
        bankAccountDetails,
        accountBalance,
      );
      alert("success", "successWithdrawnSuccessfully");
    } catch (error) {
      console.error("Error: ", error);
      alert("error", "errorOccurredWhileWithdrawingYourFunds");
    } finally {
      setIsLoading(false);
      // Reset the form
      setSelectedCurrency(null);
      setAmount("");
      setBankAccountDetails({
        accountNumber: "",
        branchNumber: "",
        bankNumber: "",
      });
    }
  };

  return (
    <div className="scrollable-content overflow-y-auto w-full content flex flex-col justify-between items-center text-black dark:text-white">
      <div className="flex flex-col w-full lg:w-[70%] justify-center lg:border rounded-lg lg:m-10 p-5">
        <h1 className="mb-5 text-3xl font-bold w-full">{t("withdraw")}</h1>
        <div className="flex flex-col lg:flex-row justify-center items-center gap-5">
          <div className="flex flex-col w-full gap-10">
            <div className="flex flex-col w-full">
              <label className="font-bold mb-1">{t("currency")}</label>
              <Select
                className="react-select-container w-full"
                classNamePrefix="react-select"
                placeholder={t("search") + "..."}
                isOptionSelected={(option) => {
                  if (!selectedCurrency) return false;
                  return option.id === selectedCurrency.id;
                }}
                onChange={setSelectedCurrency}
                components={{
                  Option: CustomOption,
                  SingleValue: SelectValue,
                }}
                options={currencies}
                value={selectedCurrency}
                isClearable={true}
                isLoading={currencies.length === 0}
              />
            </div>

            <div className="flex flex-col w-full">
              <div className="flex justify-start items-center gap-2">
                <label className="font-bold mb-1">{t("amount")}</label>
                <p className="text-sm text-gray-400">
                  {selectedCurrency && amountMessage()}
                </p>
              </div>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="react-input w-full rounded focus:ring-transparent text-lg"
                placeholder={amountInputPlaceholder()}
                disabled={!selectedCurrency}
              />
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="flex flex-col w-full h-full justify-between">
            <div className="flex flex-col w-full">
              <label className="font-bold mb-1">{t("accountNumber")}</label>
              <input
                type="text"
                value={bankAccountDetails.accountNumber}
                onChange={handleAccountNumberChange}
                className="react-input w-full rounded focus:ring-transparent text-lg"
                placeholder="123456/12"
                maxLength="9"
              />
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col w-full">
                <label className="font-bold mb-1">{t("branchNumber")}</label>
                <input
                  type="text"
                  value={bankAccountDetails.branchNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setBankAccountDetails({
                      ...bankAccountDetails,
                      branchNumber: value,
                    });
                  }}
                  className="react-input w-full rounded focus:ring-transparent text-lg"
                  placeholder="123"
                  maxLength="3"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="font-bold mb-1">{t("bankNumber")}</label>
                <input
                  type="text"
                  value={bankAccountDetails.bankNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setBankAccountDetails({
                      ...bankAccountDetails,
                      bankNumber: value,
                    });
                  }}
                  className="react-input w-full rounded focus:ring-transparent text-lg"
                  placeholder="10"
                  maxLength="2"
                />
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={isLoading}
          className={`flex justify-center items-center w-full font-bold bg-custom-teal ${!isLoading && "hover:bg-teal-500"} h-11 rounded mt-10`}
        >
          {isLoading ? (
            <div className="loading-container">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          ) : (
            t("withdraw")
          )}
        </button>
      </div>
      <Alert
        title={alertData.title}
        message={alertData.message}
        isVisible={alertVisible}
        onClose={hideAlert}
        messageType={alertData.messageType}
        action={alertData.action}
      />
      <Footer />
    </div>
  );
}