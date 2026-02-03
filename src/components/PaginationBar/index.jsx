import { useEffect, useState } from "react";
import { BsArrowLeftSquare, BsArrowRightSquare } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";

export default function PaginationBar({
    totalPagesCount,
    currentPage,
    pageRangeDisplayed = 2,
    getPreviousPage,
    getNextPage,
    getSpecificPage,
    paginationButtonTextColor,
    paginationButtonBackgroundColor,
    activePaginationButtonColor,
    activePaginationButtonBackgroundColor,
    isDisplayCurrentPageNumberAndCountOfPages = false,
    isDisplayNavigateToSpecificPageForm = false,
    section
}) {

    const [pageNumber, setPageNumber] = useState(0);

    const [windowIndex, setWindowIndex] = useState(0);

    const { i18n, t } = useTranslation();

    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.USER_LANGUAGE_FIELD_NAME_IN_LOCAL_STORAGE);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    const startPage = windowIndex * pageRangeDisplayed + 1;

    const endPage = Math.min(
        startPage + pageRangeDisplayed - 1,
        totalPagesCount
    );

    const handleNext = async () => {
        if (currentPage === endPage && endPage < totalPagesCount) {
            setWindowIndex(prev => prev + 1);
            await getSpecificPage(endPage + 1, section);
        } else {
            await getNextPage(section);
        }
    };

    const handlePrevious = async () => {
        if (currentPage === startPage && windowIndex > 0) {
            setWindowIndex(prev => prev - 1);
            await getSpecificPage(startPage - 1, section);
        } else {
            await getPreviousPage(section);
        }
    };

    const getSuitableArrow = (arrowDirection) => {
        if (arrowDirection === "to-previous") {
            if (i18n.language !== "ar") {
                return (<BsArrowLeftSquare
                    className="previous-page-icon pagination-icon me-3"
                    onClick={handlePrevious}
                />);
            }
            return (<BsArrowRightSquare
                className="previous-page-icon pagination-icon me-3"
                onClick={handlePrevious}
            />);
        } else {
            if (i18n.language !== "ar") {
                return (<BsArrowRightSquare
                    className="next-page-icon pagination-icon me-3"
                    onClick={handleNext}
                />);
            }
            return (<BsArrowLeftSquare
                className="next-page-icon pagination-icon me-3"
                onClick={handleNext}
            />);
        }
    }

    const getPaginationButtons = () => {
        const paginationButtons = [];
        for (let i = startPage; i <= endPage; i++) {
            paginationButtons.push(
                <button
                    key={i}
                    className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === i ? "selection" : ""}`}
                    onClick={async () => await getSpecificPage(i, section)}
                    style={{
                        color: currentPage === i ? activePaginationButtonColor : paginationButtonTextColor,
                        backgroundColor: currentPage === i ? activePaginationButtonBackgroundColor : paginationButtonBackgroundColor,
                    }}
                >
                    {i}
                </button>
            );
        }
        return (
            <>
                {currentPage !== 1 && getSuitableArrow("to-previous")}
                {paginationButtons}
                {currentPage !== totalPagesCount && getSuitableArrow("to-next")}
                {isDisplayCurrentPageNumberAndCountOfPages && <span className={`current-page-number-and-count-of-pages p-2 ps-3 pe-3 bg-secondary text-white ${i18n.language !== "ar" ? "me-3" : "ms-3 me-3"}`}>{t("The Page")} {currentPage} {t("of")} {totalPagesCount} {t("Pages")}</span>}
                {isDisplayNavigateToSpecificPageForm && <form
                    className="navigate-to-specific-page-form w-25"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await getSpecificPage(pageNumber, section);
                    }}
                >
                    <input
                        type="number"
                        className="form-control p-2 page-number-input"
                        placeholder={t("Enter Page Number")}
                        min="1"
                        max={totalPagesCount}
                        onChange={(e) => setPageNumber(e.target.valueAsNumber)}
                    />
                </form>}
            </>
        );
    }

    return (
        <motion.section className="pagination-bar d-flex justify-content-center align-items-center w-100 mb-3" initial={getInitialStateForElementBeforeAnimation()} whileInView={getAnimationSettings}>
            {getPaginationButtons()}
        </motion.section>
    );
}