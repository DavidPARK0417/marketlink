import Link from "next/link";
import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="FarmToBiz"
          width={32}
          height={32}
          className="object-contain"
        />
        <span className="text-2xl font-bold text-green-600">FarmToBiz</span>
      </Link>
    </header>
  );
};

export default Navbar;
