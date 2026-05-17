// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import './index.css'
import App from "./App.jsx";
import { DishProvider } from "./context/dishContext.jsx";
import { MyIngredientProvider } from "./context/myIngredientContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <DishProvider>
      <MyIngredientProvider>
        <App />
      </MyIngredientProvider>
    </DishProvider>
  </BrowserRouter>,
);
