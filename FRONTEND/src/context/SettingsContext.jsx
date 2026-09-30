import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

const currencies = {
    HTG: {
        code: "HTG",
        name: "Gourde haïtienne",
        symbol: "Gdes",
        locale: "fr-FR",
    },

    USD: {
        code: "USD",
        name: "Dollar américain",
        symbol: "$",
        locale: "en-US",
    },

    EUR: {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        locale: "fr-FR",
    },

    DOP: {
        code: "DOP",
        name: "Peso dominicain",
        symbol: "RD$",
        locale: "es-DO",
    },
};

export function SettingsProvider({ children }) {

    const [currency, setCurrency] = useState(
        () => localStorage.getItem("currency") || "HTG"
    );

    useEffect(() => {
        localStorage.setItem("currency", currency);
    }, [currency]);

    const currentCurrency = currencies[currency];

    const formatMoney = (amount) => {

        const value = Number(amount) || 0;

        return (
            new Intl.NumberFormat(
                currentCurrency.locale,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            ).format(value)
            + ` ${currentCurrency.symbol}`
        );
    };

    return (
        <SettingsContext.Provider
            value={{
                currency,
                setCurrency,
                currentCurrency,
                currencies,
                formatMoney,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}