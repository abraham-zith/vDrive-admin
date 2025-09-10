import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "antd";


export interface Signup {
  name: string;
  password: string;
  confirmPassword: string;
  contact: string;
  alternateContact: string;
}

const SignUp = () => {
  const navigate = useNavigate();
  const [signupFields, setSignupFields] = useState<Signup>({
    name: "",
    password: "",
    confirmPassword: "",
    contact: "",
    alternateContact: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    if (name === "confirmPassword") {
      const pwd = signupFields?.password || "";
      if (!value) {
        setSignupFields((prev) => ({ ...prev, confirmPassword: "" }));
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        return;
      }
      if (pwd.startsWith(value)) {
        setSignupFields((prev) => ({ ...prev, confirmPassword: value }));
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        return;
      }
      setSignupFields((prev) => ({ ...prev, confirmPassword: "" }));
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }
    if (name === "password") {
      const nextPwd = value;
      setSignupFields((prev) => {
        const nextState = { ...prev, password: nextPwd };
        if (prev.confirmPassword && !nextPwd.startsWith(prev.confirmPassword)) {
          nextState.confirmPassword = "";
          setErrors((e) => ({
            ...e,
            confirmPassword: "Passwords do not match",
          }));
        } else {
          setErrors((e) => ({ ...e, confirmPassword: "" }));
        }
        return nextState;
      });
      setErrors((prev) => ({ ...prev, password: "" }));
      return;
    }
  
    setSignupFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,18}$/;

  const validate = () => {
    let newErrors: Record<string, string> = {};
    if (!signupFields?.name) {
      newErrors.name = "Name is required";
    }
    if (!signupFields?.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex?.test(signupFields?.password)) {
      newErrors.password =
        "Password must be at least 8 characters, include one digit, one uppercase and one special character";
    }
    if (signupFields?.confirmPassword !== signupFields?.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!signupFields?.contact) {
      newErrors.contact = "Email or phone is required";
    } else if (
      !emailRegex.test(signupFields?.contact) &&
      !phoneRegex.test(signupFields?.contact)
    ) {
      newErrors.contact = "Enter valid email or phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log("Form Submitted", signupFields);
      navigate("/");
    }
  };

  const isPhone = phoneRegex?.test(signupFields?.contact);

  return (
<div className="max-w-[480px] w-full border border-gray-200 rounded-2xl shadow-sm bg-white p-10 mt-20 mx-auto">
    <div className="flex flex-col text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          V Drive
        </h1>
        <h3 className="tracking-tight text-2xl font-bold">Create Account</h3>
        <p className="text-sm text-gray-500">Sign up for your admin account</p>
      </div>
      <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
         <label className="font-bold text-sm">
           Name<span className="text-red-500">*</span>
         </label>
         <Input
         size="large"
           name="name"
           placeholder="Enter name"
          value={signupFields?.name}
           onChange={handleChange}
         />
         {errors?.name && (
           <div className="text-red-500 text-xs pt-1.5">{errors?.name}</div>
         )}
       </div>

       <div className="flex flex-col gap-y-2">
         <label className="font-bold text-sm">
           Email / Mobile Number<span className="text-red-500">*</span>
         </label>
         <Input
          size="large"
           name="contact"
           placeholder="Enter Email or Mobile number"
           value={signupFields?.contact}
           onChange={handleChange}
         />
         {errors?.contact && (
           <div className="text-red-500 text-xs pt-1.5">{errors?.contact}</div>
         )}
       </div>
      {isPhone && (
         <div className="flex flex-col gap-y-2">
           <label className="font-bold text-sm">Alternate Mobile Number</label>
           <Input
           size="large"
             name="alternateContact"
             placeholder="Enter alternate number"
             value={signupFields?.alternateContact}
             onChange={handleChange}
           />
           {errors?.alternateContact && (
             <div className="text-red-500 text-xs pt-1.5">
               {errors?.alternateContact}
             </div>
           )}
         </div>
       )}
        <div className="flex flex-col gap-y-2">
         <label className="font-bold text-sm">
           Password<span className="text-red-500">*</span>
         </label>
         <Input.Password
         size="large"
           name="password"
           placeholder="Enter password"
           value={signupFields?.password}
           onChange={handleChange}
         />
         <p className="text-xs text-gray-500">
           (Password must be 8-18 characters, include at least one uppercase
           letter, one digit, and one special character.)
         </p>
         {errors?.password && (
           <div className="text-red-500 text-xs pt-1.5">{errors?.password}</div>
         )}
       </div>
       <div className="flex flex-col gap-y-2">
         <label className="font-bold text-sm">
           Confirm Password<span className="text-red-500">*</span>
         </label>
         <Input.Password
         size="large"
           name="confirmPassword"
           placeholder="Re-enter password"
           value={signupFields?.confirmPassword}
           onChange={handleChange}
         />
         {errors?.confirmPassword && (
           <div className="text-red-500 text-xs pt-1.5">
             {errors?.confirmPassword}
           </div>
         )}
       </div>
       <Button
        type="primary"
        block
        onClick={handleSubmit}
        style={{ marginTop: 16 }}
      >
        Sign Up
      </Button>
      </div>
      </div>
      
  );
};

export default SignUp;
