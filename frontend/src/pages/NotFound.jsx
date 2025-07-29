import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@headlessui/react";

const NotFound = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-200">Oops! Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-500">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/rooms" className="mt-8">
        <Button
          as="span"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Go back to Rooms
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
