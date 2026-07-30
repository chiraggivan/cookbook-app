import LeftSideBar from "./leftSideBar";
import TopBar from "./topBar";

export default function MainLayout({ children }) {
  return (
    <div>
      <TopBar />
      <div className="hidden md:block">
        <LeftSideBar />
      </div>
      <main>{children}</main>
    </div>
  );
}
