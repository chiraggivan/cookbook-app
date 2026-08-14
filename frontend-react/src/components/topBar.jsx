import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils/appUtils";
import Input from "./input";
import { useEffect, useState } from "react";
import { GiCarrot, GiHamburgerMenu, GiSettingsKnobs } from "react-icons/gi";
import { useSearch } from "../context/globalSearchContext";

import {
  HiBookmark,
  HiClipboardList,
  HiFolder,
  HiHome,
  HiLogout,
  HiOutlinePlus,
  HiPencil,
  HiSearch,
  HiUser,
} from "react-icons/hi";
import { BsPlusCircleDotted } from "react-icons/bs";
import {
  createTheme,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  TextInput,
} from "flowbite-react";
import { FaPlus } from "react-icons/fa6";

function TopBar() {
  const user = JSON.parse(localStorage.getItem("user")) ?? "";
  const navigate = new useNavigate();
  // const [searchInput, setSearchInput] = useState("");
  const { setSearchRecipe, searchInput, setSearchInput } = useSearch();
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, []);

  // zero down to one single userName
  const userName = user.username ?? user.display_name ?? user.email;

  // for menu button (hamburger) in screen smaller than md
  const [searchText, SetSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const handleSearch = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (searchInput.trim().replace(/\s+/g, " ").toLowerCase()) {
      setSearchRecipe(searchInput.trim().replace(/\s+/g, " ").toLowerCase());
      navigate("/");
    }
  };

  // change theme of 'drawer' to make sure dark backdrop is above the topBar
  const drawerTheme = {
    root: {
      backdrop: "z-55",
    },
  };

  // handle logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(`/login`);
  };

  // this is created for drawer dropdown for hamburger
  const ProfileIcon = () => {
    if (user?.picture_url) {
      <img className="rounded-full w-6 h-6" src={user?.picture_url} alt={getInitials(userName)} />;
    } else {
      return (
        <div className="flex items-center justify-center rounded-full w-6 h-6 bg-blue-300 text-xs">
          {getInitials(userName)}
        </div>
      );
    }
  };

  // console.log("searchInput : ", searchInput);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full h-(--top-bar-height) bg-white ">
        <div className="flex flex-col w-full bg-white md:flex-row md:justify-between">
          <div className="flex w-full md:w-auto">
            {/* hamburger */}
            <div className="block ml-4 min-w-8 min-h-8 md:hidden">
              <GiHamburgerMenu
                className="h-full w-full hover:cursor-pointer"
                onClick={() => setIsOpen(true)}
              />
            </div>

            {/* logo section */}
            <div
              className=" flex flex-1 font-extrabold text-2xl tracking-tighter  px-4 py-2 items-center justify-center md:flex-none md:justify-start"
              onClick={() => {
                setSearchRecipe("");
                setSearchInput("");
                navigate("/");
              }}
            >
              eatReci
            </div>

            {/* add new recipe + */}
            <div className="block mr-4 min-w-8 min-h-8 md:hidden">
              <FaPlus
                className="h-full w-full text-app-primary"
                onClick={() => navigate("/recipe/new")}
              />
            </div>
          </div>

          <div className="">
            {/* search section */}
            <div className="hidden md:flex items-center justify-center w-full p-2">
              <input
                value={searchInput}
                className="border rounded-l-full border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 h-10 w-80 px-4 pb-1 m-1"
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                className="border text-xl rounded-r-full border-hidden bg-gray-200 text-gray-700 h-10 px-4 pb-1 m-1 
                            hover:cursor-pointer hover:ring-2 hover:ring-gray-600"
                onClick={() => {
                  if (searchInput.trim().replace(/\s+/g, " ").toLowerCase()) {
                    setSearchRecipe(searchInput.trim().replace(/\s+/g, " ").toLowerCase());
                  }
                }}
              >
                search
              </button>
            </div>
          </div>

          {/* account section */}
          <div className="hidden md:flex items-center justify-end w-[25%] pr-1 pl-1 py-2 md:pr-4">
            <button
              onClick={() => navigate("/recipe/new")}
              className="h-8  rounded-full  border-hidden px-3 pb-1 mr-1 cursor-pointer text-gray-800 bg-gray-200 text-xl hover:bg-gray-300 transition "
            >
              + Create
            </button>
            <div className="flex mim-w-9 min-h-9 h-9 w-9 rounded-full bg-blue-300 items-center justify-center">
              {user?.picture_url ? (
                <div className="w-full h-full">
                  <img
                    className="rounded-full"
                    src={user?.picture_url}
                    alt={getInitials(userName)}
                    // onError={(e) => {
                    //   console.log("Image failed:", e.currentTarget.src);
                    // }}
                  />
                </div>
              ) : (
                getInitials(userName)
              )}
            </div>
          </div>
        </div>
      </header>
      <Drawer theme={drawerTheme} className="z-60 max-w-[60%]" open={isOpen} onClose={handleClose}>
        <DrawerHeader title="MENU" titleIcon={() => <></>} />
        <DrawerItems>
          <Sidebar
            aria-label="Sidebar with multi-level dropdown example"
            className="[&>div]:bg-transparent [&>div]:p-0 w-full"
          >
            <div className="flex h-full flex-col justify-between py-2">
              <div>
                <form className="pb-3 w-full" onSubmit={handleSearch}>
                  <TextInput
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex rounded-lg border-gray-400  mx-auto placeholder:text-gray-400"
                    icon={HiSearch}
                    type="search"
                    placeholder="Search . . . "
                    required
                    size={32}
                  />
                </form>
                <SidebarItems>
                  <SidebarItemGroup>
                    <SidebarItem
                      onClick={() => {
                        setSearchRecipe("");
                        setSearchInput("");
                        setIsOpen(false);
                      }}
                      icon={HiHome}
                      href="/"
                    >
                      Home
                    </SidebarItem>
                    <SidebarItem href="/MyRecipes" icon={HiClipboardList}>
                      My Recipes
                    </SidebarItem>
                    <SidebarItem href="#" icon={HiBookmark}>
                      Weekly Plan
                    </SidebarItem>
                    <SidebarItem href="/myDishes" icon={HiFolder}>
                      Dishes Made
                    </SidebarItem>
                    <SidebarItem href="/myIngredients" icon={GiCarrot}>
                      My Ingredients
                    </SidebarItem>
                  </SidebarItemGroup>
                  <SidebarItemGroup>
                    <SidebarItem href="#" icon={ProfileIcon}>
                      Account
                    </SidebarItem>
                    <SidebarItem href="#" icon={GiSettingsKnobs}>
                      Setting
                    </SidebarItem>
                    <SidebarItem href="#" icon={HiLogout} onClick={handleLogout}>
                      Sign out
                    </SidebarItem>
                  </SidebarItemGroup>
                  {user.role === "admin" && (
                    <SidebarItemGroup>
                      <SidebarItem className="font-semibold">Admin Menu</SidebarItem>
                      <SidebarItem className="text-red-500" href="#">
                        Ingredients
                      </SidebarItem>
                      <SidebarItem className="text-red-500" href="#">
                        Users
                      </SidebarItem>
                      <SidebarItem className="text-red-500" href="#">
                        Recipes
                      </SidebarItem>
                    </SidebarItemGroup>
                  )}
                </SidebarItems>
              </div>
            </div>
          </Sidebar>
        </DrawerItems>
      </Drawer>
    </>
  );
}

export default TopBar;
