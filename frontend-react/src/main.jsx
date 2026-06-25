import "./index.css";
// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import './index.css'
import App from "./App.jsx";
import { DishProvider } from "./context/dishContext.jsx";
import { MyIngredientProvider } from "./context/myIngredientContext.jsx";
import { MyRecipeProvider } from "./context/myRecipeContext.jsx";
import { google_client_id } from "./config.js";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <DishProvider>
      <MyRecipeProvider>
        <MyIngredientProvider>
          <GoogleOAuthProvider clientId={google_client_id}>
            <App />
          </GoogleOAuthProvider>
        </MyIngredientProvider>
      </MyRecipeProvider>
    </DishProvider>
  </BrowserRouter>,
);
