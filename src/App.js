import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Wallet  from './artifacts/contracts/Wallet.sol/Wallet.json';

let WalletAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

function App() {

  const [balance, setBalance] = useState(0);
  const [amountSend, setAmountSend] = useState();
  const [amountWithdraw, setAmountWithdraw] = useState();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getBalance();
  }, []);

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(WalletAddress, Wallet.abi, provider);
      try {
        let overrides = {
          from: accounts[0]
        }
        const data = await contract.getBalance(overrides);
        setBalance(String(data));
      } catch (err) {
        setError('Une erreur est survenue');
        console.log('Error: ', err);
      }
    }
  }

  async function transfer() {
    if (!amountSend) {
      return;
    }
    setError('');
    setSuccess('');
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      try{
        const tx ={
          from : accounts[0],
          to : WalletAddress,
          value : ethers.utils.parseEther(amountSend)
        }
        const transation = await signer.sendTransaction(tx);
        await transation.wait();
        setAmountSend('');
        getBalance();
        setSuccess('Transaction réussie');
      }
      catch(err){
        setError('Une erreur est survenue');
        console.log('Error: ', err);
    }
  }
}

  async function withdraw() {
    if(!amountWithdraw) {
      return;
    }
    setError('');
    setSuccess('');
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(WalletAddress, Wallet.abi, signer);
    try {
      const transaction = await contract.withdrawMoney(accounts[0], ethers.utils.parseEther(amountWithdraw));
      await transaction.wait();
      setAmountWithdraw('');
      getBalance();
      setSuccess('Votre argent a bien été retiré du portefeuille ! ');
    }
    catch(err) {
      setError('Une erreur est survenue');
      console.log('Error: ', err);
    }
  }


  function changeAmountSend(e) {
    setAmountSend(e.target.value);
  }

  function changeAmountWithdraw(e) {
    setAmountWithdraw(e.target.value);
  }

  return (
    <div className="App">
      <div className='container'>

        <div className='logo'>
          <i className="fa-brands fa-ethereum"></i>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <h2>{balance / 10**18} <span className='eth'>eth</span></h2>

        <div className='wallet_flex'>
          
          <div className='walletG'>
            <h3>Envoyer de l'ether</h3>
            <input type="number" placeholder="Montant en Ethers" onChange={changeAmountSend} />
            <button onClick={transfer}>Envoyer</button>
          </div>

          <div className="walletD">
            <h3>Retirer de l'ether</h3>
            <input type="number" placeholder="Montant en Ethers" onChange={changeAmountWithdraw} />
            <button onClick={withdraw}>Retirer</button>
          </div>
        </div>
      
      </div>
    </div>
  );
}

export default App;
