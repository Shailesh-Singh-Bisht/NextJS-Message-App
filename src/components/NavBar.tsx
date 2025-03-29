"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";

const NavBar = () => {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="p-4 md:p-6 bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <a className="text-2xl font-semibold text-gray-800 hover:text-gray-600 transition-all" href="#">
          Message Feedback
        </a>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-gray-600 text-sm md:text-base">
                Welcome, <strong>{user?.username || user?.email}</strong>
              </span>
              <Button 
                className="w-full md:w-auto bg-red-500 hover:bg-red-600 transition-all"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 transition-all">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
