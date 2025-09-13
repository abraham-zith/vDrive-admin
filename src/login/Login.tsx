import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "antd";
import { useAuth } from "../contexts/AuthContext";

const { Text } = Typography;

export interface Login {
  userName: string;
  password: string;
}
const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [login, setLogin] = useState<Login>({
    userName: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt?.target;
    setLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    let newErrors: Record<string, string> = {};
    if (!login?.userName) {
      newErrors.userName = "Registered Email/Mobile Number is required";
    }
    if (!login?.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await authLogin(login);
        navigate("/");
      } catch (error) {
        console.error("Login failed", error);
      }
    }
  };

  // const handleForgotPassword = () => {
  //   navigate("/reset-password");
  // };

  // const handleSignUp = () => {
  //   navigate("/signup");
  // };

  return (
    <div className="max-w-[400px] border border-gray-300 rounded-xl shadow-md bg-white flex flex-col gap-4 p-6 my-10 mx-auto">
      <div>
        <Text>
          Username<Text type="danger">*</Text>
        </Text>
        <Input
          size="large"
          name="userName"
          placeholder="Enter registered Email/Mobile Number"
          value={login?.userName}
          onChange={handleLogin}
        />
        {errors?.userName && (
          <div className="text-red-500 text-xs pt-1.5">{errors?.userName}</div>
        )}
      </div>
      <div>
        <Text>
          Password<Text type="danger">*</Text>
        </Text>
        <Input.Password
          size="large"
          name="password"
          placeholder="Enter Password"
          value={login?.password}
          onChange={handleLogin}
        />
        {errors?.password && (
          <div className="text-red-500 text-xs pt-1.5">{errors?.password}</div>
        )}
      </div>
      {/* <Button
        type="link"
        block
        onClick={handleForgotPassword}
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        Forgot password?
      </Button> */}
      <div className="flex flex-col items-center gap-[10px]">
        <Button
          size="large"
          type="primary"
          block
          onClick={handleSubmit}
          style={{ marginTop: 16, width: 75 }}
        >
          Login
        </Button>
        {/* <div>
          <Text>
            Or Sign Up using
            <Text>
              {" "}
              <Button
                type="link"
                block
                onClick={handleSignUp}
                style={{ width: 75 }}
              >
                Sign Up
              </Button>
            </Text>
          </Text>{" "}
        </div> */}
      </div>
    </div>
  );
};

export default Login;
