import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

// Function to get the Ethereum contract
const getEthereumContract = () => {

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract; 
};

export const TransactionProvider = ({ children }) => { 
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));

    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
        
    };

    const addAllTransactions = async () => {
        try{

            if (!ethereum) return alert("Please install metamask");

            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.addAllTransactions();
       
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
              }));

            console.log(availableTransactions);
        }catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) {
                alert("Please install MetaMask.");
                return;
            }

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                
                addAllTransactions();

            } else {
                console.log(error);
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    };

    const checkIfTransactionsExist = async () => {
        try {
            if (!ethereum) throw new Error("No Ethereum object");
            const transactionsContract = getEthereumContract();
            const transactionCount = await transactionsContract.addTransactionCount();
            window.localStorage.setItem("transactionCount", transactionCount);
        } catch (error) {
            console.log("Error in checkIfTransactionsExist:", error);
        }
    };
    

    const connectWallet = async () => {
        try {
            if (!ethereum) {
                alert("Please install MetaMask.");
                return;
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            console.log("Connected account:", accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            throw new Error("No ethereum object.");
        }
    };


    const sendTransaction = async () => {
        try{
            if(!ethereum) return alert("Please install metamask");

            const { addressTo, amount, keyword, message} = formData;    
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({ 
                method:'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 gwei
                    value: parsedAmount._hex, 
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            console.log(`Success - ${transactionHash.hash}`);
            setIsLoading(false);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());
            }   catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction }}>
            {children} 
        </TransactionContext.Provider>
    );
};
