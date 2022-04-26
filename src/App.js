import logo from './logo.svg';
import './App.css';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { useEffect, useState } from 'react';
import { mnemonicGenerate } from '@polkadot/util-crypto';

function App() {
    const keyring = new Keyring({ type: 'sr25519' });
    const wsProvider = new WsProvider('wss://rococo-rpc.polkadot.io');

    const [api, setApi] = useState(null);
    const [textBalance, setTextBalance] = useState('');
    const [accountInfo, setAccountInfo] = useState('');
    const [name, setName] = useState('');
    const [phase, setPhase] = useState('');

    const connect = async () => {

        const api = new ApiPromise({ provider: wsProvider });
        await api.isReady;

        console.log(api.genesisHash.toHex());
        return api;
    }

    useEffect(() => {
        const logConnect = async () => {
            const api = await connect();
            setApi(api);
        }

        logConnect();

        const _phase = mnemonicGenerate();
        setPhase(_phase);
    }, [])


    const stateQueryDoc = async () => {
        // Initialize the API as in previous sections
        // The actual address that we will use
        const ADDR = '5FXGwPpXkV1juaTzxUzVyxdqgDP3umwWEqZGbS6CWa2c2qg3';

        // Retrieve the last timestamp
        const now = await api.query.timestamp.now();

        // Retrieve the account balance & nonce via the system module
        const { nonce, data: balance } = await api.query.system.account(ADDR);

        console.log(`${now}: Số dư ${balance.free} and số giao dịch: ${nonce}`);
        console.log(balance);
        setTextBalance(`Số dư: ${balance.free} - số giao dịch: ${nonce}`)

    }

    const addAccount = async () => {


        // Some mnemonic phrase
        //const PHRASE = mnemonicGenerate();

        // Add an account, straight mnemonic
        const newPair = keyring.addFromUri(phase, { name: name });
        //const newDeri = keyring.addFromUri('son');
        console.log(newPair);
        console.log(`${newPair.meta.name}: has address ${newPair.address} with publicKey [${newPair.publicKey}]`);
        setAccountInfo(`Tên: ${newPair.meta.name} - Địa chỉ: ${newPair.address}`)
    }

    const transactions = async () => {
        // Sign and send a transfer from Alice to Bob

        //const newPair = keyring.addFromUri(phase, { name: 'alice' });

        const txHash = await api.tx.balances
            .transfer('5EcGUtyE1Jtxie5kmn5k8L6t461GjtczNx4naR3GyUJy9Lqe', 10)
            .signAndSend('5FXGwPpXkV1juaTzxUzVyxdqgDP3umwWEqZGbS6CWa2c2qg3', (result) => {
                console.log(`Current status is ${result.status}`);
            });

        // Show the hash
        console.log(`Submitted with hash ${txHash}`);
    }

    const getInfo = async () => {
        const ADDR = '5D7ERbkBHnti1paqYtVpg7Np5G8WDBSdY64QDnaGFshwCFhV';
        const res = await api.query.system.account(ADDR);
        
        console.log(api);
    }

    return (
        <div className="App">
            <p>test polkadot</p>
            <button onClick={stateQueryDoc}>Lấy số dư, giao dịch</button>
            <p>{textBalance}</p>
            <br></br>
            <p>Cụm ghi nhớ: {phase}</p>
            <input placeholder='Tên' value={name} onChange={e => setName(e.target.value)} />
            <button onClick={addAccount}>Tạo tài khoản mới</button>
            <p>Tài khoản mới: {accountInfo}</p>

            <br/>
            <button onClick={transactions}>transactions</button>
            <button onClick={getInfo}>Get detail account</button>
        </div>
    );
}

export default App;
