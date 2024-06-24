import { useEffect, useState } from "react";
import { ProductListings } from "./pages";
import Navbar from "./components/Navbar";
import { Index as Route } from "./routes/index";
import { ethers } from "ethers";
import addresses from "./constants/networkMapping.json";
import abi from "./constants/VirtualTryOn.json";
function App() {
  const [provider, setProvider] = useState(null);
  const [virtualTryOn, setVirtualTryOn] = useState(null);
  const [itemList, setItemList] = useState(null);
  const [account, setAccount] = useState("");
  const [networkId, setNetworkId] = useState("0x0");
  const [signer, setSigner] = useState(null);

  const connectHandler = async () => {
    const providers = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    await providers.send("eth_requestAccounts", []);
    const signers = providers.getSigner();
    let network = await providers.getNetwork();
    network = network.chainId;
    const address = addresses[network.toString()]["VirtualTryOn"];
    const contract = new ethers.Contract(address, abi, providers);
    setVirtualTryOn(contract);
    setProvider(providers);
    setSigner(signers);
    setAccount(ethers.utils.getAddress(accounts[0]));
    setNetworkId(network);
    fetchDataHandler(contract);
  };

  const fetchDataHandler = async (contract) => {
    const numItems = await contract.numberOfItems();
    const items = [];
    for (let i = 0; i < numItems; i++) {
      const item = await contract.items(i + 1);
      items.push(item);
    }
    setItemList(items);
  };
  const buyHandler = async (product) => {
    const costa = product.cost.toNumber();
    // const cost = ethers.utils.parseEther(costa);
    let transaction = await virtualTryOn
      .connect(signer)
      .buy(product.id.toNumber(), { value: costa });
    await transaction.wait(1);
    console.log("Has bought");
  };
  // useEffect(() => {
  //   fetchDataHandler();
  // }, []);
  console.log(itemList);
  return (
    <>
      <Route
        provider={provider}
        virtualTryOn={virtualTryOn}
        itemList={itemList}
        buyHandler={buyHandler}
        fetchDataHandler={fetchDataHandler}
        connectHandler={connectHandler}
        account={account}
      />
    </>
  );
}

export default App;
