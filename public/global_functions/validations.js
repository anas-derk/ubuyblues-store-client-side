import { isValidPhoneNumber }  from 'libphonenumber-js';
import axios from 'axios';

// تعريف دالة للتحقق من الإيميل هل صالح أم لا
function isEmail(email) {
    return email.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
}

// تعريف دالة لمعرفة هل الملف هو صورة أم لا
function isImage(file) {
    // التحقق من كون نوع الملف هو صورة من امتداد jpg or png 
    return file.type === "image/png" || file.type === "image/jpeg";
}

// تعريف دالة للتحقق من كلمة السر هل صالحة أم لا
function isValidPassword(password) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
}

// تعريف دالة للتحقق من رقم الموبايل هو رقم صالح أم لا ( رقم سوري أم لا )
function isValidMobilePhone(mobilePhone, countryCode) {
    return isValidPhoneNumber(mobilePhone, countryCode);
}

// تعريف دالة للتحقق من قيم المدخلات
function inputValuesValidation(inputs) {
    // تعريف المصفوفة التي ستخزن الأخطاء
    let errorsObject = {};
    // إنشاء حلقة للمرور على كل المدخلات المرسلة إلى التابع وعمل التحقق المطلوب بناء على القواعد المرسلة
    for (let input of inputs) {
        // تخزين القواعد الخاصة بالمُدخل في متغير لاستخدامه لاحقاً
        if (input) {
            let inputRules = input.rules;
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isRequired !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if ((!input.value && input.value !== 0) || input.value.length === 0) {
                    errorsObject[input.name] = inputRules.isRequired.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isEmail !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (!isEmail(input.value)) {
                    errorsObject[input.name] = inputRules.isEmail.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isEmailOrMobilePhone !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (!isEmail(input.value) && (isNaN(input.value) || !isValidMobilePhone(input.value))) {
                    errorsObject[input.name] = inputRules.isEmailOrMobilePhone.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isValidPassword !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (!isValidPassword(input.value) && input.value !== "") {
                    errorsObject[input.name] = inputRules.isValidPassword.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isValidMobilePhone !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (!isValidMobilePhone(input.value, inputRules.isValidMobilePhone.countryCode)) {
                    errorsObject[input.name] = inputRules.isValidMobilePhone.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isImage !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (!isImage(input.value)) {
                    errorsObject[input.name] = inputRules.isImage.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isImages !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                let isFoundFileNotImage = false;
                for (let file of input.value) {
                    if (!isImage(file)) {
                        isFoundFileNotImage = true;
                        break;
                    }
                }
                if (isFoundFileNotImage) {
                    errorsObject[input.name] = inputRules.isImages.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.minLength !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (input.value.length < inputRules.minLength.value) {
                    errorsObject[input.name] = inputRules.minLength.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.maxLength !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (input.value.length > inputRules.maxLength.value) {
                    errorsObject[input.name] = inputRules.maxLength.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.isMatch !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (input.value != inputRules.isMatch.value) {
                    errorsObject[input.name] = inputRules.isMatch.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
            // التحقق من كون القاعدة داخل كائن القواعد موجودة 
            if (typeof inputRules.minNumber !== "undefined") {
                // التحقق من أنّ القاعدة محققة ، وفي حالة لم تكن محققة فإننا نضيف الخطأ إلى مصفوفة الأخطاء
                if (Number(input.value) < inputRules.minNumber.value) {
                    errorsObject[input.name] = inputRules.minNumber.msg;
                    // في حالة وجود خطأ نقوم بتجاهل كل التعليمات اللاحقة داخل التكرار الحالي للحلقة والانتقال إلى التكرار التالي
                    continue;
                }
            }
        }
    }
    return errorsObject;
}

async function getAdminInfo(adminToken) {
    try{
        const res = await axios.get(`${process.env.BASE_API_URL}/admins/user-info`, {
            headers: {
                "Authorization": adminToken,
            },
        });
        return await res.data;
    }
    catch(err) {
        throw err;
    }
}

// تصدير الدوال المطلوبة
export default { isEmail, inputValuesValidation, getAdminInfo };