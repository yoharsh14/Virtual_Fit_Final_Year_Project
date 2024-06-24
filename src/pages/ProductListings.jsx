import React, { useEffect, useState } from "react";
import { clothingProducts } from "../data/productList";
import ModelViewer from "../components/ModelViewer";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import texture from "./../assets/texture.jpeg";
import txt1 from "./../assets/txt1.jpg";
import txt2 from "./../assets/txt2.jpg";
import txt3 from "./../assets/txt3.jpg";
import txt4 from "./../assets/txt4.jpg";
import txt5 from "./../assets/txt5.jpg";

const texturesObj = [
  {
    name: "Texture 1",
    image: txt1,
  },
  {
    name: "Texture 2",
    image: txt2,
  },
  {
    name: "Texture 3",
    image: txt3,
  },
  {
    name: "Texture 4",
    image: txt4,
  },
  {
    name: "Texture 5",
    image: txt5,
  },
  {
    name: "Texture 6",
    image: texture,
  },
];

const ProductListings = ({
  provider,
  virtualTryOn,
  itemList,
  buyHandler,
  fetchDataHandler,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState(texturesObj[0]);
  const [selectedModel, setSelectedModel] = useState(itemList[0].model);
  const [selectedProperty, setSelectedProperty] = useState(
    itemList[0].materialPty
  );
  const [productSelected, setProductSelected] = useState(itemList[0]);
  const [productBought, setProductBought] = useState(false);
  const handleClick = (modelLocation, materialPty, product) => {
    setIsOpen(true);
    setSelectedModel(modelLocation);
    setSelectedProperty(materialPty);
    setProductSelected(product);
  };
  const callBuyHandler = async (item) => {
    console.log(item)
    await buyHandler(item);
    setProductBought(true);
    setTimeout(() => {
      setProductBought(false);
    }, 5000);
  };

  console.log(itemList);
  return (
    <div className="">
      {isOpen && (
        <Modal handleClose={() => setIsOpen(false)} isOpen={isOpen}>
          <div className="flex flex-col sm:flex-row items-center w-full h-full">
            <div className="w-[100%] sm:w-[50%] min-h-48 sm:h-full bg-yellow-50 overflow-hidden">
              <ModelViewer
                texture={selectedTexture.image}
                modelLocation={selectedModel}
                materialPty={selectedProperty}
              />
            </div>
            <div className="w-[100%] flex flex-col justify-between sm:w-[50%] h-full p-4 overflow-scroll">
              {/* <div className="h-[100%]"></div> */}
              <div className="p-4">
                <div className="w-full flex gap-3 items-center justify-center flex-wrap flex-col">
                  {productBought && (
                    <div className="bg-green-300 p-2 rounded-lg">
                      You Bought the item
                    </div>
                  )}
                  <h1 className="text-xl font-semibold italic font-mono">
                    Select Textures
                  </h1>
                  <div className="flex gap-2">
                    {texturesObj.map((item, index) => (
                      <div
                        className="h-[40px] w-[40px] overflow-hidden rounded-full cursor-pointer"
                        key={index}
                        onClick={() => setSelectedTexture(item)}
                      >
                        <img
                          src={item.image}
                          alt="texture image"
                          className={`h-full w-full object-cover border-[6px] ${
                            selectedTexture.name === item.name
                              ? "border-gray-800"
                              : ""
                          } overflow-hidden rounded-full`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-[4rem]">
                  <h2 className="text-xl font-semibold">
                    {productSelected.name}
                  </h2>
                  <p className="text-lg font-light">
                    {productSelected.description}
                  </p>

                  <div className="bg-blue-400 w-fit px-4 rounded-lg text-white">
                    {productSelected.category}
                  </div>
                  <div className="font-bold text-2xl">
                    ${productSelected.cost.toNumber()}
                  </div>
                  <div className="font-bold text-2xl">
                    In Stock:{productSelected.stock.toNumber()}
                  </div>
                </div>

                <div className="flex flex-col w-full mt-[1rem]">
                  <button className="bg-yellow-500 text-white">
                    <Link to="/tryon">Try On Cloth</Link>
                  </button>
                  <button className="bg-pink-500 text-white">
                    Try on 3D Model
                  </button>
                  <button
                    className="bg-cyan-500 text-white"
                    onClick={() => callBuyHandler(productSelected)}
                  >
                    Buy Now 
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <div className="h-full mx-auto px-[1rem] sm:p-[4rem] p-[4rem]">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-8">
          {itemList.map((item) => (
            <div
              key={item.id}
              className="flex mx-auto flex-col w-full max-w-sm rounded-xl overflow-hidden border hover:border-blue-400 transition-all duration-200 cursor-pointer"
            >
              <div className="flex-shrink-0 h-48">
                <img
                  src={item.image}
                  alt="product-image"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between flex-1 bg-gradient-to-r from-white to-yellow-50 p-4">
                <div>
                  <h4 className="text-lg font-semibold">{item.name}</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 flex justify-between gap-4">
                  <button
                    className="bg-black text-white w-full py-2 rounded-md hover:opacity-70"
                    onClick={() =>
                      handleClick(item.model, item.materialPty, item)
                    }
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListings;
