import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "antd";

const { Text } = Typography;

export interface Signup {
  name: string;
  password: string;
  confirmPassword: string;
  email: string;
  contact: string;
}

const SignUp = () => {
  const navigate = useNavigate();
  const [signupFields, setSignupFields] = useState<Signup>({
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    contact: "",
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

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const contactRegex = /^([^\s@]+@[^\s@]+\.[^\s@]+|[0-9]{6,15})$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,18}$/;

  const validate = () => {
    const newErrors: Record<string, string> = {};
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
    if (!signupFields?.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(signupFields?.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (signupFields?.contact && !contactRegex.test(signupFields?.contact)) {
      newErrors.contact = "Enter a valid email or phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      navigate("/");
    }
  };

  return (
    <div className="max-w-[400px] border border-gray-300 rounded-xl shadow-md bg-white flex flex-col gap-4 p-6 my-10 mx-auto">
      <div>
        <Text>
          Name<Text type="danger">*</Text>
        </Text>
        <Input
          name="name"
          placeholder="Enter name"
          value={signupFields?.name}
          onChange={handleChange}
        />
        {errors?.name && (
          <div className="text-red-500 text-xs pt-1.5">{errors?.name}</div>
        )}
      </div>
      <div>
        <Text>
          Password<Text type="danger">*</Text>
        </Text>
        <Input.Password
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
      <div>
        <Text>
          Confirm Password<Text type="danger">*</Text>
        </Text>
        <Input.Password
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
      <div>
        <Text>
          Email<Text type="danger">*</Text>
        </Text>
        <Input
          name="email"
          placeholder="Enter email address"
          value={signupFields?.email}
          onChange={handleChange}
        />
        {errors?.email && (
          <div className="text-red-500 text-xs pt-1.5">{errors?.email}</div>
        )}
      </div>
      <div>
        <Text>Contact (Email or Phone):</Text>
        <Input
          name="contact"
          placeholder="Enter email or phone number"
          value={signupFields?.contact}
          onChange={handleChange}
        />
        {errors?.contact && (
          <div className="text-red-500 text-xs pt-1.5">{errors?.contact}</div>
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
  );
};

export default SignUp;
