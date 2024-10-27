import { useState, useEffect } from 'react';

const baseURL = "https://v6.exchangerate-api.com/v6/8db7739e6288167ec792b984/latest/";

const CurrencyConverter = () => {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('INR');
    const [currencies, setCurrencies] = useState([]);
    const [result, setResult] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await fetch(baseURL + "USD");
                const data = await response.json();
                setCurrencies(Object.keys(data.conversion_rates));
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setErrorMessage("Failed to load currency list. Please try again.");
            }
        };
        fetchCurrencies();
    }, []);

    const handleConvert = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            setErrorMessage("Please enter a valid amount.");
            return;
        }
        setErrorMessage('');
        try {
            const response = await fetchWithTimeout(baseURL + fromCurrency, 5000);
            const data = await response.json();
            const rate = data.conversion_rates[toCurrency];
            if (rate) {
                setResult(`${amount} ${fromCurrency} = ${(amount * rate).toFixed(2)} ${toCurrency}`);
            } else {
                setErrorMessage("This currency is not available.");
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const handleReset = () => {
        setAmount('');
        setFromCurrency('USD');
        setToCurrency('INR');
        setResult('');
        setErrorMessage('');
    };

    const fetchWithTimeout = async (resource, timeout) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(resource, { signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error("Request timed out. Please try again.");
            }
            throw new Error("Failed to fetch data. Please check your network.");
        }
    };

    return (
        <div className="card p-4 shadow" style={{ width: '350px' }}>
            <h2 className="text-center mb-4">Currency Converter</h2>
            <div className="form-group">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-control"
                    placeholder="Enter amount"
                    required
                />
            </div>
            <div className="form-row align-items-center">
                <div className="col">
                    <select
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        className="form-control"
                    >
                        {currencies.map(currency => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-auto">
                    <button onClick={handleSwap} className="btn btn-outline-secondary">⇆</button>
                </div>
                <div className="col">
                    <select
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        className="form-control"
                    >
                        {currencies.map(currency => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <button onClick={handleConvert} className="btn btn-primary btn-block mt-3">Convert</button>
            <button onClick={handleReset} className="btn btn-secondary btn-block mt-2">Reset</button>
            <div className="text-center mt-3 font-weight-bold text-success">{result}</div>
            <div className="text-center text-danger mt-2">{errorMessage}</div>
        </div>
    );
};

export default CurrencyConverter;
