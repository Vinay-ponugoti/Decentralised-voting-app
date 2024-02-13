import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login'
import Connected from './Components/Connected';
import './App.css';

function App() {

  const [provider, setprovider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingstatus, setVotingStatus] = useState(true);
  const [remainingTime, setremainingTime] = useState('');
  const [candidate, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [CanVote, setCanVote] = useState(true);


  useEffect( () => {
    getCandidats();
    getRemainingTime();
    getCurrentStatus();
    if (window.ethereum){
      window.ethereum.on('accontsChanged', handleAccountsChanged);
    } 
    return() => {
      if (window.ethereum){
        window.ethereum.removeListener('accontsChanged', handleAccountsChanged)
      }
    }
  });

  async function Vote(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance =new ethers.Contract(
          contractAddress, contractAbi, signer
        );
        const tx = await contractInstance.vote(number);
        await tx.wait();
        canVote();
  }


  async function canVote(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance =new ethers.Contract(
          contractAddress, contractAbi, signer
        );
        const voteStatus = await contractInstance.voters(await signer.getAddress());
        setCanVote(voteStatus);
  }

  async function getCandidats( ){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance =new ethers.Contract(
          contractAddress, contractAbi, signer
        );
        const candidatesList = await contractInstance.getAllVotesOfCandiates();
        const formatedCandidates = candidatesList.map((candidate, index) => {
          return{
            index: index,
            name: candidate.name,
            voteCount: candidate.voteCount.toNumber()
          }
        });
        setCandidates(formatedCandidates);
  }

  async function getCurrentStatus(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance =new ethers.Contract(
          contractAddress, contractAbi, signer
        );
        const status = await contractInstance.getVotingStatus();
        console.log(status);
        setVotingStatus(status);
  }

  async function getRemainingTime() {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance =new ethers.Contract(
          contractAddress, contractAbi, signer
        );
        const time = await contractInstance.getRemainingTime();
        setremainingTime(parseInt(time, 16));
  }

  function handleAccountsChanged(accounts){
    if (accounts.length > 0 && account !== accounts[0] ){
    setAccount(accounts[0]);
    canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }


  async function connectToMetamask(){
    if(window.ethereum) {
      try{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setprovider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected : " + address);
        setIsConnected(true);
        canVote();
      } catch (err) {
        console.error(err);
    } 
    } else {
      console.error("Metamask is not Connected in the browser")
    }
   }

   async function handleNumberChange(e){
    setNumber(e.target.value);
   }

  return (
    <div className="App">
      {isConnected ? (<Connected 
                           account = {account}
                           candidates = {candidate}
                           remainingTime = {remainingTime}
                           number = { number}
                           handleNumberChange = {handleNumberChange}
                           voteFunction = {Vote}
                           showButton = {CanVote}
                           />) : (<Login connectWallet = {connectToMetamask}/>)}
    </div>
  );
}

export default App;
