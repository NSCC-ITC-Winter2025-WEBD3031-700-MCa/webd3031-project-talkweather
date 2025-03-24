import Link from "next/link";
import UserButton from "./user-button";
import SearchBox from "./search-box";

interface Props {}

const Navbar = ({}: Props) => {
  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-center bg-card shadow-md dark:border-b dark:border-white/20">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-5 py-3 xl:px-0">
        <div className="flex items-center justify-center gap-5 sm:gap-10">
          <Link href="/" className="font-mono text-2xl font-bold leading-[1]">
            <span className="text-primary">TALK</span>WEATHER
          </Link>
          <SearchBox />
        </div>
        <div>
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default Navbar;