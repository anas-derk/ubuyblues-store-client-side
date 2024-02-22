import { useState } from "react";
import { BsArrowLeftSquare, BsArrowRightSquare } from "react-icons/bs";

export default function PaginationBar({ totalPagesCount, currentPage, getPreviousPage, getNextPage, getSpecificPage }) {

    const [pageNumber, setPageNumber] = useState(0);

    const getPaginationButtons = () => {
        const paginationButtons = [];
        for (let i = 1; i <= totalPagesCount; i++) {
            if (i < 11) {
                paginationButtons.push(
                    <button
                        key={i}
                        className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === i ? "selection" : ""} ${i === 1 ? "ms-3" : ""}`}
                        onClick={async () => await getSpecificPage(i)}
                    >
                        {i}
                    </button>
                );
            }
        }
        if (totalPagesCount > 10) {
            paginationButtons.push(
                <span className="me-3 fw-bold" key={`${Math.random()}-${Date.now()}`}>...</span>
            );
            paginationButtons.push(
                <button
                    key={totalPagesCount}
                    className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === totalPagesCount ? "selection" : ""}`}
                    onClick={async () => await getSpecificPage(i)}
                >
                    {totalPagesCount}
                </button>
            );
        }
        return (
            <>
                {currentPage !== 1 && <BsArrowLeftSquare
                    className="previous-page-icon pagination-icon"
                    onClick={async () => await getPreviousPage()}
                />}
                {paginationButtons}
                {currentPage !== totalPagesCount && <BsArrowRightSquare
                    className="next-page-icon pagination-icon me-3"
                    onClick={async () => await getNextPage()}
                />}
                <span className="current-page-number-and-count-of-pages p-2 ps-3 pe-3 bg-secondary text-white me-3">The Page {currentPage} of {totalPagesCount} Pages</span>
                <form
                    className="navigate-to-specific-page-form w-25"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await getSpecificPage(pageNumber);
                    }}
                >
                    <input
                        type="number"
                        className="form-control p-1 ps-2 page-number-input"
                        placeholder="Enter Page Number"
                        min="1"
                        max={totalPagesCount}
                        onChange={(e) => setPageNumber(e.target.valueAsNumber)}
                    />
                </form>
            </>
        );
    }

    return (
        <section className="pagination-bar d-flex justify-content-center align-items-center">
            {getPaginationButtons()}
        </section>
    );
}