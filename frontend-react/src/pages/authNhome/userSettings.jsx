import { useState, useEffect } from "react";
import Button from "../../components/button";
import api from "../../api/axios";
import DropdownWithScrollBar from "../../components/dropdownWithScrollBar";
import { Spinner } from "flowbite-react";

const INITIAL_SETTINGS = {
  name: "Chirag Givan",
  userId: "USR-98421",
  email: "chirag.givan@example.com",
  password: "••••••••••••",
  country: "India",
};

const SETTING_FIELDS = [
  { id: "name", title: "Name", type: "text" },
  { id: "userId", title: "User ID", type: "text" },
  { id: "email", title: "Email", type: "email" },
  { id: "password", title: "Password", type: "password" },
  {
    id: "country",
    title: "Country",
    type: "select",
    options: ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany"],
  },
];

export default function UserSettings() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [editingField, setEditingField] = useState(null); // stores field object when modal is open
  const [tempValue, setTempValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  /////////////////////////////////
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [countryId, setCountryId] = useState();
  const [country, setCountry] = useState();
  const [currencyId, setCurrencyId] = useState();
  const [crncySymbol, setCurncySymbol] = useState();
  const [displayName, setDisplayName] = useState();
  const [tempName, setTempName] = useState();
  const [email, setEmail] = useState();
  const [tempEmail, setTempEmail] = useState(); // future provision for changing email
  const [emailVerified, setEmailVerfied] = useState();
  const [username, setUsername] = useState();
  const [picURL, setPicURL] = useState();
  const [errMsg, setErrMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, seteModalTitle] = useState();
  const [isloadingMData, setIsLoadingMData] = useState(false);
  const [editCountry, setEditCountry] = useState(false);
  const [countryList, setCountryList] = useState([]);

  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // update tempName to same as display name.
  useEffect(() => {
    setTempName(displayName);
  }, [displayName]);

  // ------------------- INITIAL fetch user's data ----------------------------
  useEffect(() => {
    const url = `/userDetail/api/userDetailsForSettings/${user.user_id}`;
    const method = "get";

    setIsLoading(true);
    const fetchData = async () => {
      try {
        const res = await api[method](url);
        const data = res?.data?.data;
        setCountry(data.country_name);
        setCountryId(data.country_id);
        setCurncySymbol(data.currency_symbol);
        setCurrencyId(data.currency_id);
        setDisplayName(data.display_name);
        setEmail(data.email);
        setEmailVerfied(data.email_verified);
        setPicURL(data.picture_url);
        setUsername(data.username);
      } catch (error) {
        console.log("Error in userSettings page :", error);
        setErrMsg("Something went wrong. Please try later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ----------------- fetch country list from db for Country Modal ------------------
  useEffect(() => {
    if (editCountry && countryList.length === 0) {
      const url = `/userDetail/api/userDetailsForSettings/country/countryList`;
      const method = "get";

      setIsLoadingMData(true);
      const fetchCountries = async () => {
        try {
          const res = await api[method](url);
          setCountryList(res?.data?.data);
        } catch (error) {
          console.log("Error while fetching country list :", error);
          setErrMsg("Something went wrong while fetching country list");
        } finally {
          setIsLoadingMData(false);
        }
      };

      fetchCountries();
    }
  }, [editCountry]);

  // Open modal for editing
  const handleEditClick = (field) => {
    setEditingField(field);
    setTempValue(settings[field.id]);
    setShowPassword(false);
  };

  // Close modal without saving
  const handleCloseModal = () => {
    setEditingField(null);
    setTempValue("");
  };

  // -------------------------- Handle submit button for Country update ------------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    // close the modal
    setEditCountry(false);
    setIsModalOpen(false);
    setIsLoading(true);

    // check if country changed from the previous country
    if (Number(countryId) === Number(user.country_id)) {
      // console.log("Same country no need to call api");
      return;
    }

    // Country id not same , proceed with api call
    const url = `/userDetail/api/userDetailsForSettings/updateCountry/${countryId}`;
    const method = "get";

    try {
      const res = await api[method](url);
      const newUserDetails = res?.data?.user;
      // update current page data with useState variable and update token and user data in localStorage
      setCountryId(newUserDetails.country_id);
      setCountry(newUserDetails.country_name);
      setCurrencyId(newUserDetails.currency_id);
      setCurncySymbol(newUserDetails.currency_symbol);
      localStorage.setItem("token", res?.data?.token);
      localStorage.setItem("user", JSON.stringify(res?.data?.user));
    } catch (error) {
      console.log("Error while updating user's country :", error);
      setErrMsg("Something went wrong while saving. Please try later");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------- Handle submit button for Name update ---------------------------------
  const handleSaveName = async (e) => {
    e.preventDefault();

    const newName = tempName.trim().replace(/\s+/g, " ");
    if (newName.length === 0) {
      setErrMsg("Can't have empty name.");
      return;
    }
    // close the modal
    setEditName(false);
    setIsModalOpen(false);
    setIsLoading(true);

    // Country id not same , proceed with api call
    const url = `/userDetail/api/userDetailsForSettings/updateName/${tempName}`;
    const method = "get";

    try {
      const res = await api[method](url);
      console.log("res is :", res);
      // check id success is false as old and new names are same
      if (res?.data?.success === false) {
        // as old and new name are same, just return to th page
        return;
      } else {
        setDisplayName(tempName);
        localStorage.setItem("token", res?.data?.token);
        localStorage.setItem("user", JSON.stringify(res?.data?.user));
      }
    } catch (error) {
      console.log("Error while updating user's country :", error);
      setErrMsg("Something went wrong while saving. Please try later");
    } finally {
      setIsLoading(false);
    }
  };

  // console.log("user :", user);
  return (
    <div className="min-h-screen  px-2 bg-slate-50 mt-(--top-bar-height)  md:ml-(--left-side-bar) md:p-5 lg:px-8">
      {!isLoading && (
        <div className="max-w-3xl py-4 mx-auto space-y-6">
          {/* Main Header */}
          <header className="border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your personal account details and preferences.
            </p>
          </header>

          {/* Settings Div */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
            {/* Name section */}
            <div className="p-5 flex items-start justify-between  transition-colors">
              {/* Title and Value Column */}
              <div className="space-y-1 pr-4">
                <div className="font-bold text-slate-900 text-base">{"Name"}</div>
                <div className="text-slate-600 font-normal text-sm">{displayName ?? "--"}</div>
              </div>

              {/* Right Aligned Edit Button */}
              <Button
                type="button"
                onClick={() => {
                  setEditName(true);
                  setIsModalOpen(true);
                  seteModalTitle("Name");
                }}
                className="border rounded-md ml-auto px-4 py-1 text-sm font-semibold text-gray-600 
                        hover:text-gray-700 hover:bg-slate-100 transition-colors hover:cursor-pointer"
              >
                Edit
              </Button>
            </div>

            {/* User ID/username */}
            <div className="p-5 flex items-start justify-between  transition-colors">
              {/* Title and Value Column */}
              <div className="space-y-1 pr-4">
                <div className="font-bold text-slate-900 text-base">{"User ID"}</div>
                <div className="text-slate-600 font-normal text-sm">{username ?? "--"}</div>
              </div>

              {/* Right Aligned Edit Button */}
              {/* <Button
                type="button"
                onClick={() => handleEditClick(field)}
                className="border rounded-md ml-auto px-4 py-1 text-sm font-semibold text-gray-600 
                        hover:text-gray-700 hover:bg-slate-100 transition-colors hover:cursor-pointer"
              >
                Edit
              </Button> */}
            </div>

            {/* Email section */}
            <div className="p-5 flex items-start justify-between  transition-colors">
              {/* Title and Value Column */}
              <div className="space-y-1 pr-4">
                <div className="font-bold text-slate-900 text-base">{"Email"}</div>
                <div className="text-slate-600 font-normal text-sm">{email ?? "--"}</div>
              </div>

              {/* Right Aligned Edit Button */}
              {/* <Button
                type="button"
                onClick={() => handleEditClick(field)}
                className="border rounded-md ml-auto px-4 py-1 text-sm font-semibold text-gray-600 
                        hover:text-gray-700 hover:bg-slate-100 transition-colors hover:cursor-pointer"
              >
                Edit
              </Button> */}
            </div>

            {/* Password section */}
            <div className="p-5 flex items-start justify-between  transition-colors">
              {/* Title and Value Column */}
              <div className="space-y-1 pr-4">
                <div className="font-bold text-slate-900 text-base">{"Password"}</div>
                <div className="text-slate-600 font-normal text-sm">
                  {email || username ? "••••••••••••" : "--"}
                </div>
              </div>

              {/* Right Aligned Edit Button */}
              {/* <Button
                type="button"
                onClick={() => handleEditClick(field)}
                className="border rounded-md ml-auto px-4 py-1 text-sm font-semibold text-gray-600 
                        hover:text-gray-700 hover:bg-slate-100 transition-colors hover:cursor-pointer"
              >
                Edit
              </Button> */}
            </div>

            {/* Country section */}
            <div className="p-5 flex items-start justify-between  transition-colors">
              {/* Title and Value Column */}
              <div className="space-y-1 pr-4">
                <div className="font-bold text-slate-900 text-base">{"Country"}</div>
                <div className="text-slate-600 font-normal text-sm">
                  {country ? ` ${country} (${crncySymbol})` : "--"}
                </div>
              </div>

              {/* Right Aligned Edit Button */}
              <Button
                type="button"
                onClick={() => {
                  setEditCountry(true);
                  setIsModalOpen(true);
                  seteModalTitle("Country");
                }}
                className="border rounded-md ml-auto px-4 py-1 text-sm font-semibold text-gray-600 
                        hover:text-gray-700 hover:bg-slate-100 transition-colors hover:cursor-pointer"
              >
                Edit
              </Button>
            </div>
          </div>

          {errMsg && <div className="px-2 text-red-600 text-sm">{errMsg}</div>}

          {/*  MAIN Generic modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  {/* header */}
                  <h3 className="text-lg font-bold text-slate-900">Edit {modalTitle}</h3>
                  <button
                    onClick={() => {
                      setEditCountry(false);
                      setIsModalOpen(false);
                      setErrMsg("");
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  >
                    ✕
                  </button>
                </div>

                {/* Country section for modal along with buttons */}
                {editCountry && (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      {/*Dropdown list for countr, once the countries are fetched for modal from backend */}
                      {!isloadingMData && (
                        <DropdownWithScrollBar
                          title={"Country"}
                          options={countryList}
                          value={countryId}
                          optionValueText={"country_id"}
                          optionText={"name"}
                          onChange={setCountryId}
                          placeholder="Select"
                          error
                        />
                      )}

                      {/* show loading screen in modal at dropdown place while data is being fetched from backend */}
                      {isloadingMData && (
                        <div className="flex w-full h-20 items-center justify-center">
                          <Spinner
                            theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
                            color="default"
                            aria-label="Loading"
                            size="xl"
                          />
                        </div>
                      )}

                      {/* <div className="relative">
                    <input
                      type={
                        editingField.type === "password" && showPassword
                          ? "text"
                          : editingField.type
                      }
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                      required
                    />
                    {editingField.type === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    )}
                      </div> */}
                    </div>

                    {/* Modal Actions - Cancel and Save button */}
                    <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditCountry(false);
                          setIsModalOpen(false);
                          setErrMsg("");
                        }}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Name section for Modal along with buttons */}
                {editName && (
                  <form onSubmit={handleSaveName} className="space-y-4">
                    <header className="text-gray-800 font-semibold text-lg">Name</header>
                    <input
                      type={"text"}
                      value={tempName}
                      maxLength={20}
                      onChange={(e) => {
                        setTempName(e.target.value);
                        setErrMsg("");
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                      required
                    />
                    {/* Modal Actions - Cancel and Save button */}
                    <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditName(false);
                          setIsModalOpen(false);
                          setErrMsg("");
                        }}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {errMsg && <div className="px-2 text-red-600 text-sm">{errMsg}</div>}
              </div>
            </div>
          )}

          {/* Settings Container Div with Border */}
          {/* <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
            {SETTING_FIELDS.map((field) => (
              <div
                key={field.id}
                className="p-5 flex items-center justify-between  transition-colors"
              > */}
          {/* Title and Value Column */}
          {/* <div className="space-y-1 pr-4">
                  <div className="font-bold text-slate-900 text-base">{field.title}</div>
                  <div className="text-slate-600 font-normal text-sm">{settings[field.id]}</div>
                </div> */}

          {/* Right Aligned Edit Button */}
          {/* <Button
                  type="button"
                  onClick={() => handleEditClick(field)}
                  className="border rounded-md ml-auto px-4 py-1 text-sm font-semibold text-gray-600 
                        hover:text-gray-700 hover:bg-slate-100 transition-colors hover:cursor-pointer"
                >
                  Edit
                </Button>
              </div>
            ))}
          </div> */}
        </div>
      )}
      {isLoading && (
        <div className="flex w-full h-screen items-center justify-center">
          <Spinner
            theme={{ color: { default: "fill-[var(--color-app-primary)]" } }}
            color="default"
            aria-label="Loading"
            size="xl"
          />
        </div>
      )}
      {/* Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit {editingField.title}</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {editingField.title}
                </label>

                {/* Render select or input based on field type */}
                {editingField.type === "select" ? (
                  <select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                  >
                    {editingField.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type={
                        editingField.type === "password" && showPassword
                          ? "text"
                          : editingField.type
                      }
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                      required
                    />
                    {editingField.type === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
