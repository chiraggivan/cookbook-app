import LeftSideBar from "./leftSideBar";
import TopBar from "./topBar";

export default function MainLayout({ children }) {
  return (
    <div>
      <TopBar />
      <LeftSideBar />
      <main>{children}</main>
    </div>
  );
}
