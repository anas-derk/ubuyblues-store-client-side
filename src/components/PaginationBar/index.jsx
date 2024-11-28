import { useEffect, useState } from "react";
import { BsArrowLeftSquare, BsArrowRightSquare } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { getAnimationSettings, getInitialStateForElementBeforeAnimation, handleSelectUserLanguage } from "../../../public/global_functions/popular";
import { motion } from "motion/react";

export default function PaginationBar({
    totalPagesCount,
    currentPage,
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

    const { i18n, t } = useTranslation();
    
    useEffect(() => {
        const userLanguage = localStorage.getItem(process.env.userlanguageFieldNameInLocalStorage);
        handleSelectUserLanguage(userLanguage === "ar" || userLanguage === "en" || userLanguage === "tr" || userLanguage === "de" ? userLanguage : "en", i18n.changeLanguage);
    }, []);

    const getSuitableArrow = (arrowDirection) => {
        if (arrowDirection === "to-previous") {
            if (i18n.language !== "ar") {
                return (<BsArrowLeftSquare
                    className="previous-page-icon pagination-icon me-3"
                    onClick={async () => await getPreviousPage(section)}
                />);
            }
            return (<BsArrowRightSquare
                className="previous-page-icon pagination-icon me-3"
                onClick={async () => await getPreviousPage(section)}
            />);
        } else {
            if (i18n.language !== "ar") {
                return (<BsArrowRightSquare
                    className="next-page-icon pagination-icon me-3"
                    onClick={async () => await getNextPage(section)}
                />);
            }
            return (<BsArrowLeftSquare
                className="next-page-icon pagination-icon me-3"
                onClick={async () => await getNextPage(section)}
            />);
        }
    }

    const getPaginationButtons = () => {
        const paginationButtons = [];
        for (let i = 1; i <= totalPagesCount; i++) {
            if (i < 11) {
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
        }
        if (totalPagesCount > 10) {
            paginationButtons.push(
                <span className="me-3 fw-bold" key={`${Math.random()}-${Date.now()}`}>...</span>
            );
            paginationButtons.push(
                <button
                    key={totalPagesCount}
                    className={`pagination-button me-3 p-2 ps-3 pe-3 ${currentPage === totalPagesCount ? "selection" : ""}`}
                    onClick={async () => await getSpecificPage(totalPagesCount, section)}
                >
                    {totalPagesCount}
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