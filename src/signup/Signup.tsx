import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "antd";
import './signupStyle.css'

const { Text } = Typography;

export interface Signup {
  name: string;
  password: string;
  confirmPassword: string;
  contact: string;
  alternateContact: string;
}

const SignUp = () => {
  const navigate= useNavigate();
  const [signupFields, setSignupFields] = useState<Signup>({
    name: "",
    password: "",
    confirmPassword: "",
    contact: "",
    alternateContact: ""
  });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
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
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }
    if (name === "password") {
      const nextPwd = value;
      setSignupFields((prev) => {
        const nextState = { ...prev, password: nextPwd };
        if (prev.confirmPassword && !nextPwd.startsWith(prev.confirmPassword)) {
          nextState.confirmPassword = "";
          setErrors((e) => ({ ...e, confirmPassword: "Passwords do not match" }));
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
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

  const validate = () => {
    let newErrors: Record<string, string> = {};
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
      navigate('/')
    }
  };

  const isPhone = phoneRegex?.test(signupFields?.contact);

  return (
    <div
    className="signup-container"
    >
      <div>
        <Text strong>Enter Name</Text>
        <Input
          name="name"
          placeholder="Provide name"
          value={signupFields.name}
          onChange={handleChange}
        />
        {errors.name && <div className ="err-msg">{errors.name}</div>}
      </div>
      <div >
        <Text strong>Enter Password<Text className="mandatory">*</Text></Text>
        <Input.Password
          name="password"
          placeholder="Provide password"
          value={signupFields.password}
          onChange={handleChange}
          visibilityToggle={{
            visible: passwordVisible,
            onVisibleChange: setPasswordVisible,
          }}
        />
        {errors.password && (
          <div className ="err-msg">{errors.password}</div>
        )}
      </div>
      <div>
        <Text strong>Confirm Password<Text className="mandatory">*</Text></Text>
        <Input.Password
          name="confirmPassword"
          placeholder="Re-enter password"
          value={signupFields.confirmPassword}
          onChange={handleChange}
          visibilityToggle={{
            visible: passwordVisible,
            onVisibleChange: setPasswordVisible,
          }}
        />
        {errors.confirmPassword && (
          <div className ="err-msg">{errors.confirmPassword}</div>
        )}
      </div>
      <div >
        <Text strong>Enter Email / Mobile Number<Text className="mandatory">*</Text></Text>
        <Input
          name="contact"
          placeholder="Provide Email or Mobile number"
          value={signupFields.contact}
          onChange={handleChange}
        />
        {errors.contact && (
          <div className ="err-msg">{errors.contact}</div>
        )}
      </div>
      {isPhone && (
        <div >
          <Text strong>Alternate Mobile Number:</Text>
          <Input
            name="alternateContact"
            placeholder="Provide alternate number"
            value={signupFields.alternateContact}
            onChange={handleChange}
          />
          {errors.alternateContact && (
            <div className ="err-msg">{errors.alternateContact}</div>
          )}
        </div>
      )}
      <Button
        type="primary"
        block
        onClick={handleSubmit}
        style={{ marginTop: 16 }}
      >
        Sign Up
      </Button>
    </div>
  );
};

export default SignUp;
