import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import SharedLayout from "../components/SharedLayout.jsx";
import ProductListings from "../pages/ProductListings.jsx";
import BodyDimensions from "../components/BodyDimensions.jsx";
import TryOn from "../components/TryOn.jsx";

const Index = ({
  provider,
  virtualTryOn,
  itemList,
  buyHandler,
  fetchDataHandler,
  connectHandler,
  account,
}) => {
  return (
    <Routes>
      <Route
        element={
          <SharedLayout
            connectHandler={connectHandler}
            provider={provider}
            account={account}
          />
        }
      >
        <Route path="/" element={<Home />} index />
        <Route
          path="/explore"
          element={
            <ProductListings
              provider={provider}
              virtualTryOn={virtualTryOn}
              itemList={itemList}
              buyHandler={buyHandler}
              fetchDataHandler={fetchDataHandler}
            />
          }
        />
        <Route path="/dimension" element={<BodyDimensions />} />
        <Route path="/tryon" element={<TryOn />} />
      </Route>
    </Routes>
  );
};

export { Index };
