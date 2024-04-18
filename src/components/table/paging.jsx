import React, { useState, useEffect } from "react";

export const Paging = (props) => {
  const { totalPageNumber, currentPage, setCurrentPage } = props;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [length, setLength] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Check if the window width is less than 768px, adjust length accordingly
    if (windowWidth < 768) {
      setLength(3); // For mobile devices
    } else {
      setLength(5); // For desktop
    }
  }, [windowWidth]);

  function nextPage() {
    if (currentPage === totalPageNumber()) {
      return;
    }
    setCurrentPage(currentPage + 1);
  }

  function previousPage() {
    if (currentPage === 1) {
      return;
    }
    setCurrentPage(currentPage - 1);
  }

  function goToPage(page) {
    setCurrentPage(page);
  }

  if (totalPageNumber() === 1) {
    return null;
  }

  return (
    <div className="flex justify-end items-center mt-2">
      <button
        onClick={previousPage}
        className="material-icons w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:hover:bg-transparent disabled:dark:hover:bg-transparent"
        disabled={currentPage === 1}
      >
        navigate_before
      </button>
      <button
        onClick={() => goToPage(1)}
        className={`w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md ${currentPage === 1 ? "bg-gray-200 dark:bg-gray-700" : ""}`}
      >
        1
      </button>
      {currentPage > 3 ? (
        <p className="w-8 h-8 m-px grid text-center items-center">...</p>
      ) : null}
      {Array.from(
        { length },
        (_, i) => currentPage + i - (length === 5 ? 2 : 1),
      ).map((number) => {
        if (number > 1 && number < totalPageNumber()) {
          return (
            <button
              key={`pageButton-${number}`}
              onClick={() => goToPage(number)}
              className={`w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600  rounded-md ${currentPage === number ? "bg-gray-200 dark:bg-gray-700" : ""}`}
            >
              {number}
            </button>
          );
        }
      })}
      {currentPage < totalPageNumber() - (length === 5 ? 3 : 2) ? (
        <p className="w-8 h-8 m-px grid text-center items-center">...</p>
      ) : null}
      <button
        onClick={() => goToPage(totalPageNumber())}
        className={`w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md ${currentPage === totalPageNumber() ? "bg-gray-200 dark:bg-gray-700" : ""}`}
      >
        {totalPageNumber()}
      </button>
      <button
        onClick={nextPage}
        className="material-icons w-8 h-8 m-px hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:hover:bg-transparent disabled:dark:hover:bg-transparent"
        disabled={totalPageNumber() === currentPage}
      >
        navigate_next
      </button>
    </div>
  );
};
