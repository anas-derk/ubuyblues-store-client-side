import Head from "next/head";
import Header from "@/components/Header";
import validations from "../../../public/global_functions/validations";
import { useState, useEffect } from "react";
import LoaderPage from "@/components/LoaderPage";
import UPaymentsImage from "@/../public/images/UPayments.webp";
import PayPalImage from "@/../public/images/PayPal.webp";

export default function Checkout() {
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [allProductsData, setAllProductsData] = useState([]);
    const [pricesDetailsSummary, setPricesDetailsSummary] = useState({
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0,
    });
    const [userInfo, setUserInfo] = useState("");
    const [requestNotes, setRequestNotes] = useState("");
    const [isShippingToOtherAddress, setIsShippingToOtherAddress] = useState(false);
    const [formValidationErrors, setFormValidationErrors] = useState({});
    const [isWaitStatus, setIsWaitStatus] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("upayments");
    useEffect(() => {
        const userId = localStorage.getItem("asfour-store-user-id");
        if (userId) {
            axios.get(`${process.env.BASE_API_URL}/users/user-info/${userId}`)
                .then((res) => {
                    const result = res.data;
                    if (result !== "Sorry, The User Is Not Exist !!, Please Enter Another User Id ..") {
                        setUserInfo(result);
                        let allProductsData = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
                        if (Array.isArray(allProductsData)) {
                            if (allProductsData.length > 0) {
                                const totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
                                const totalDiscount = calcTotalOrderDiscount(allProductsData);
                                const totalPriceAfterDiscount = calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount);
                                setPricesDetailsSummary({
                                    totalPriceBeforeDiscount,
                                    totalDiscount,
                                    totalPriceAfterDiscount,
                                });
                                setAllProductsData(allProductsData);
                            }
                        }
                        setIsLoadingPage(false);
                    }
                })
                .catch((err) => console.log(err));
        } else {
            let allProductsData = JSON.parse(localStorage.getItem("asfour-store-user-cart"));
            if (Array.isArray(allProductsData)) {
                if (allProductsData.length > 0) {
                    const totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
                    const totalDiscount = calcTotalOrderDiscount(allProductsData);
                    const totalPriceAfterDiscount = calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount);
                    setPricesDetailsSummary({
                        totalPriceBeforeDiscount,
                        totalDiscount,
                        totalPriceAfterDiscount,
                    });
                    setAllProductsData(allProductsData);
                }
            }
            setIsLoadingPage(false);
        }
    }, []);
    const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
        let tempTotalPriceBeforeDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalPriceBeforeDiscount += product.price * product.quantity;
        });
        return tempTotalPriceBeforeDiscount;
    }
    const calcTotalOrderDiscount = (allProductsData) => {
        let tempTotalDiscount = 0;
        allProductsData.forEach((product) => {
            tempTotalDiscount += product.discount * product.quantity;
        });
        return tempTotalDiscount;
    }
    const calcTotalOrderPriceAfterDiscount = (totalPriceBeforeDiscount, totalDiscount) => {
        return totalPriceBeforeDiscount - totalDiscount;
    }
    const validateFormFields = () => {
        let errorsObject = validations.inputValuesValidation([
            {
                name: "first_name_for_billing_address",
                value: userInfo.billing_address.first_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, First Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "last_name_for_billing_address",
                value: userInfo.billing_address.last_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "country_for_billing_address",
                value: userInfo.billing_address.country,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "street_address_for_billing_address",
                value: userInfo.billing_address.street_address,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "city_for_billing_address",
                value: userInfo.billing_address.city,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "postal_code_for_billing_address",
                value: userInfo.billing_address.postal_code,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "phone_number_for_billing_address",
                value: userInfo.billing_address.phone_number,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            },
            {
                name: "email_for_billing_address",
                value: userInfo.billing_address.email,
                rules: {
                    isRequired: {
                        msg: "Sorry, Email Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, Invalid Email !!",
                    },
                },
            },
            isShippingToOtherAddress ? {
                name: "first_name_for_shipping_address",
                value: userInfo.shipping_address.first_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, First Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "last_name_for_shipping_address",
                value: userInfo.shipping_address.last_name,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "country_for_shipping_address",
                value: userInfo.shipping_address.country,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "street_address_for_shipping_address",
                value: userInfo.shipping_address.street_address,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "city_for_shipping_address",
                value: userInfo.shipping_address.city,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "postal_code_for_shipping_address",
                value: userInfo.shipping_address.postal_code,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "phone_number_for_shipping_address",
                value: userInfo.shipping_address.phone_number,
                rules: {
                    isRequired: {
                        msg: "Sorry, Last Name Field Can't Be Empty !!",
                    },
                },
            } : null,
            isShippingToOtherAddress ? {
                name: "email_for_shipping_address",
                value: userInfo.shipping_address.email,
                rules: {
                    isRequired: {
                        msg: "Sorry, Email Field Can't Be Empty !!",
                    },
                    isEmail: {
                        msg: "Sorry, Invalid Email !!",
                    },
                },
            } : null,
        ]);
        return errorsObject;
    }
    const confirmRequest = () => {
        try {
            const errorsObject = validateFormFields();
            setFormValidationErrors(errorsObject);
            if (Object.keys(errorsObject).length == 0) {
                setIsWaitStatus(true);
                if (paymentMethod === "upayments") {

                } else {
                    
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    return (
        <div className="checkout">
            <Head>
                <title>Asfour Store - Checkout</title>
            </Head>
            {!isLoadingPage ? <>
                <Header />
                <div className="page-content text-white p-4">
                    <div className="container-fluid">
                        <h1 className="h3 mb-4 fw-bold">Payment</h1>
                        <div className="row align-items-center">
                            <div className="col-xl-6">
                                <h6 className="mb-4 fw-bold">Billing Details</h6>
                                <form className="edit-customer-billing-address-form" onSubmit={(e) => e.preventDefault()}>
                                    <section className="first-and-last-name mb-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>First Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.first_name_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder="Please Enter New First Name Here"
                                                    defaultValue={userInfo ? userInfo.billing_address.first_name : ""}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, first_name: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.first_name_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.first_name_for_billing_address}</span>
                                                </p>}
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Last Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.last_name_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder="Please Enter Last Name Here"
                                                    defaultValue={userInfo ? userInfo.billing_address.last_name : ""}
                                                    onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, last_name: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.last_name_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.last_name_for_billing_address}</span>
                                                </p>}
                                            </div>
                                        </div>
                                    </section>
                                    <section className="company-name mb-4">
                                        <h6>Company Name (Optional)</h6>
                                        <input
                                            type="text"
                                            className="p-2"
                                            placeholder="Please Enter New Company Name Here"
                                            defaultValue={userInfo ? userInfo.billing_address.company_name : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, company_name: e.target.value.trim() } })}
                                        />
                                    </section>
                                    <section className="country mb-4">
                                        <h6>Country / Area <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.country_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Country / Area Here"
                                            defaultValue={userInfo ? userInfo.billing_address.country : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, country: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.country_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.country_for_billing_address}</span>
                                        </p>}
                                    </section>
                                    <section className="street-address mb-4">
                                        <h6>Street Addres / Neighborhood <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.street_address_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Street Address / Neighborhood"
                                            defaultValue={userInfo ? userInfo.billing_address.street_address : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, street_address: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.street_address_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.street_address_for_billing_address}</span>
                                        </p>}
                                    </section>
                                    <section className="apartment-number mb-4">
                                        <h6>Apartment Number, Ward, Unit, Etc . ( Optional )</h6>
                                        <input
                                            type="number"
                                            className="p-2"
                                            placeholder="Please Enter New Apartment Number, Ward, Unit, Etc"
                                            defaultValue={userInfo ? userInfo.billing_address.apartment_number.toString() : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, apartment_number: e.target.value } })}
                                        />
                                    </section>
                                    <section className="city-number mb-4">
                                        <h6>City <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.city_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New City Name"
                                            defaultValue={userInfo ? userInfo.billing_address.city : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, city: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.city_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.city_for_billing_address}</span>
                                        </p>}
                                    </section>
                                    <section className="postal-code-number mb-4">
                                        <h6>Postal Code / Zip <span className="text-danger">*</span></h6>
                                        <input
                                            type="number"
                                            className={`p-2 ${formValidationErrors.postal_code_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Postal Code / Zip"
                                            defaultValue={userInfo ? userInfo.billing_address.postal_code.toString() : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, postal_code: e.target.value } })}
                                        />
                                        {formValidationErrors.postal_code_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.postal_code_for_billing_address}</span>
                                        </p>}
                                    </section>
                                    <section className="phone-number mb-4">
                                        <h6>Phone Number <span className="text-danger">*</span></h6>
                                        <input
                                            type="number"
                                            className={`p-2 ${formValidationErrors.phone_number_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Phone Number"
                                            defaultValue={userInfo ? userInfo.billing_address.phone_number.toString() : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, phone_number: e.target.value } })}
                                        />
                                        {formValidationErrors.phone_number_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.phone_number_for_billing_address}</span>
                                        </p>}
                                    </section>
                                    <section className="email mb-4">
                                        <h6>Email <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.email_for_billing_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Email"
                                            defaultValue={userInfo ? userInfo.billing_address.email : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, billing_address: { ...userInfo.billing_address, email: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.email_for_billing_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.email_for_billing_address}</span>
                                        </p>}
                                    </section>
                                </form>
                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="flexCheckDefault"
                                        onChange={(e) => setIsShippingToOtherAddress(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Do You Want To Ship To A Different Address ?
                                    </label>
                                </div>
                                {isShippingToOtherAddress && <form className="edit-customer-shipping-address-form" onSubmit={(e) => e.preventDefault()}>
                                    <section className="first-and-last-name mb-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>First Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.first_name_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder="Please Enter New First Name Here"
                                                    defaultValue={userInfo ? userInfo.shipping_address.first_name : ""}
                                                    onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, first_name: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.first_name_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.first_name_for_shipping_address}</span>
                                                </p>}
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Last Name <span className="text-danger">*</span></h6>
                                                <input
                                                    type="text"
                                                    className={`p-2 ${formValidationErrors.last_name_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                                    placeholder="Please Enter Last Name Here"
                                                    defaultValue={userInfo ? userInfo.shipping_address.last_name : ""}
                                                    onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, last_name: e.target.value.trim() } })}
                                                />
                                                {formValidationErrors.last_name_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                                    <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                                    <span>{formValidationErrors.last_name_for_shipping_address}</span>
                                                </p>}
                                            </div>
                                        </div>
                                    </section>
                                    <section className="company-name mb-4">
                                        <h6>Company Name (Optional)</h6>
                                        <input
                                            type="text"
                                            className="p-2"
                                            placeholder="Please Enter New Company Name Here"
                                            defaultValue={userInfo ? userInfo.shipping_address.company_name : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, company_name: e.target.value.trim() } })}
                                        />
                                    </section>
                                    <section className="country mb-4">
                                        <h6>Country / Area <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.country_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Country / Area Here"
                                            defaultValue={userInfo ? userInfo.shipping_address.country : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, country: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.country_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.country_for_shipping_address}</span>
                                        </p>}
                                    </section>
                                    <section className="street-address mb-4">
                                        <h6>Street Addres / Neighborhood <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.street_address_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Street Address / Neighborhood"
                                            defaultValue={userInfo ? userInfo.shipping_address.street_address : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, street_address: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.street_address_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.street_address_for_shipping_address}</span>
                                        </p>}
                                    </section>
                                    <section className="apartment-number mb-4">
                                        <h6>Apartment Number, Ward, Unit, Etc . ( Optional )</h6>
                                        <input
                                            type="number"
                                            className="p-2"
                                            placeholder="Please Enter New Apartment Number, Ward, Unit, Etc"
                                            defaultValue={userInfo ? userInfo.shipping_address.apartment_number.toString() : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, apartment_number: e.target.value } })}
                                        />
                                    </section>
                                    <section className="city-number mb-4">
                                        <h6>City <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.city_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New City Name"
                                            defaultValue={userInfo ? userInfo.shipping_address.city : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, city: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.city_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.city_for_shipping_address}</span>
                                        </p>}
                                    </section>
                                    <section className="postal-code-number mb-4">
                                        <h6>Postal Code / Zip <span className="text-danger">*</span></h6>
                                        <input
                                            type="number"
                                            className={`p-2 ${formValidationErrors.postal_code_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Postal Code / Zip"
                                            defaultValue={userInfo ? userInfo.shipping_address.postal_code.toString() : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, postal_code: e.target.value } })}
                                        />
                                        {formValidationErrors.postal_code_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.postal_code_for_shipping_address}</span>
                                        </p>}
                                    </section>
                                    <section className="phone-number mb-4">
                                        <h6>Phone Number <span className="text-danger">*</span></h6>
                                        <input
                                            type="number"
                                            className={`p-2 ${formValidationErrors.phone_number_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Phone Number"
                                            defaultValue={userInfo ? userInfo.shipping_address.phone_number.toString() : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, phone_number: e.target.value } })}
                                        />
                                        {formValidationErrors.phone_number_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.phone_number_for_shipping_address}</span>
                                        </p>}
                                    </section>
                                    <section className="email mb-4">
                                        <h6>Email <span className="text-danger">*</span></h6>
                                        <input
                                            type="text"
                                            className={`p-2 ${formValidationErrors.email_for_shipping_address ? "border-3 border-danger mb-3" : ""}`}
                                            placeholder="Please Enter New Email"
                                            defaultValue={userInfo ? userInfo.shipping_address.email : ""}
                                            onChange={(e) => setUserInfo({ ...userInfo, shipping_address: { ...userInfo.shipping_address, email: e.target.value.trim() } })}
                                        />
                                        {formValidationErrors.email_for_shipping_address && <p className="bg-danger p-2 form-field-error-box m-0">
                                            <span className="me-2"><HiOutlineBellAlert className="alert-icon" /></span>
                                            <span>{formValidationErrors.email_for_shipping_address}</span>
                                        </p>}
                                    </section>
                                </form>}
                                <h6 className="mb-3">Request Notes ( Optional )</h6>
                                <textarea
                                    className="p-2"
                                    placeholder="Notes About Request, Example: Note About Request Delivery"
                                    onChange={(e) => setRequestNotes(e.target.value.trim())}
                                ></textarea>
                            </div>
                            <div className="col-xl-6">
                                <section className="order-total border border-3 p-4 ps-5 pe-5 text-start" id="order-total">
                                    <h5 className="fw-bold mb-5 text-center">Your Request</h5>
                                    <div className="row total pb-3 mb-5">
                                        <div className="col-md-9 fw-bold p-0">
                                            Product
                                        </div>
                                        <div className="col-md-3 fw-bold p-0 text-md-end">
                                            Sum
                                        </div>
                                    </div>
                                    {allProductsData.map((product, productIndex) => (
                                        <div className="row total pb-3 mb-5" key={productIndex}>
                                            <div className="col-md-9 fw-bold p-0">
                                                ( {product.name} ) x {product.quantity}
                                            </div>
                                            <div className="col-md-3 fw-bold p-0 text-md-end">
                                                {product.price * product.quantity} $
                                            </div>
                                        </div>
                                    ))}
                                    <div className="row total-price-before-discount total pb-3 mb-5">
                                        <div className="col-md-9 fw-bold p-0">
                                            Total Price Before Discount
                                        </div>
                                        <div className="col-md-3 fw-bold p-0 text-md-end">
                                            {pricesDetailsSummary.totalPriceBeforeDiscount} $
                                        </div>
                                    </div>
                                    <div className="row total-price-discount total pb-3 mb-5">
                                        <div className="col-md-9 fw-bold p-0">
                                            Total Discount
                                        </div>
                                        <div className="col-md-3 fw-bold p-0 text-md-end">
                                            {pricesDetailsSummary.totalDiscount} $
                                        </div>
                                    </div>
                                    <div className="row total-price-after-discount total pb-3 mb-4">
                                        <div className="col-md-9 fw-bold p-0">
                                            Total Price After Discount
                                        </div>
                                        <div className="col-md-3 fw-bold p-0 text-md-end">
                                            {pricesDetailsSummary.totalPriceAfterDiscount} $
                                        </div>
                                    </div>
                                    {/* Start Payement Method Section */}
                                    <section className="payment-method mb-4 border border-2 p-3">
                                        <div className="row align-items-center border-bottom pb-3">
                                            <div className="col-md-6 text-start">
                                                <input
                                                    type="radio"
                                                    checked
                                                    id="upayments-radio"
                                                    className="me-2 radio-input"
                                                    name="radioGroup"
                                                    onChange={(e) => setPaymentMethod("upayments")}
                                                />
                                                <label htmlFor="#upayments-radio">UPayments</label>
                                            </div>
                                            <div className="col-md-6 text-end">
                                                <img src={UPaymentsImage.src} alt="UPayments Image" />
                                            </div>
                                        </div>
                                        <div className="row align-items-center pt-3">
                                            <div className="col-md-6 text-start">
                                                <input
                                                    type="radio"
                                                    id="paypal-radio"
                                                    className="me-2 radio-input"
                                                    name="radioGroup"
                                                    onChange={(e) => setPaymentMethod("paypal")}
                                                />
                                                <label htmlFor="#upayments-radio">PayPal</label>
                                            </div>
                                            <div className="col-md-6 text-end">
                                                <img src={PayPalImage.src} alt="PayPal Image" />
                                            </div>
                                        </div>
                                    </section>
                                    {/* End Payement Method Section */}
                                    {!isWaitStatus && !successMsg && !errorMsg && <button
                                        className="checkout-link p-2 w-100 d-block text-center fw-bold"
                                        onClick={confirmRequest}
                                    >
                                        Confirm Request
                                    </button>}
                                    {isWaitStatus && <button
                                        className="checkout-link p-2 w-100 d-block text-center fw-bold"
                                        disabled
                                    >
                                        Waiting ...
                                    </button>}
                                    {errorMsg && <button
                                        className="checkout-link p-2 w-100 d-block text-center fw-bold"
                                        disabled
                                    >
                                        {errorMsg}
                                    </button>}
                                    {successMsg && <button
                                        className="checkout-link p-2 w-100 d-block text-center fw-bold"
                                        disabled
                                    >
                                        {successMsg}
                                    </button>}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </> : <LoaderPage />}
        </div>
    );
}