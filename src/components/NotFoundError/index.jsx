import { PiSmileySad } from "react-icons/pi";
import { motion } from "motion/react";

export default function NotFoundError({ errorMsg }) {
    return (
        <div className="not-found-product not-found-error text-center d-flex flex-column justify-content-center align-items-center">
            <motion.div
                initial={{
                    opacity: 0
                }}
                animate={{
                    opacity: 1,
                    transition: {
                        delay: 0.5,
                        duration: 0.3
                    }
                }}
            >
                <PiSmileySad className="sorry-icon mb-5" />
            </motion.div>
            <motion.h3
                className="h5"
                initial={{
                    opacity: 0
                }}
                animate={{
                    opacity: 1,
                    transition: {
                        delay: 0.8,
                        duration: 0.3
                    }
                }}
            >{errorMsg}</motion.h3>
        </div>
    );
}