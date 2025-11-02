import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "antd";
import type { InputRef } from "antd";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginAsync } from "../store/slices/authSlice";
import FullScreenLoader from "../components/FullScreenLoader";

const { Text } = Typography;

export interface Login {
  userName: string;
  password: string;
}
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, setLogin] = useState<Login>({
    userName: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userNameRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt?.target;
    setLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKeyDown = (
    evt: React.KeyboardEvent<HTMLInputElement>,
    field: string
  ) => {
    if (evt.key === "Enter") {
      if (field === "userName" && login.userName.trim()) {
        passwordRef.current?.focus();
      } else if (
        field === "password" &&
        login.userName.trim() &&
        login.password.trim()
      ) {
        handleSubmit();
      }
    }
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

  const handleSubmit = async (evt?: React.FormEvent) => {
    evt?.preventDefault();
    if (validate()) {
      try {
        await dispatch(loginAsync(login)).unwrap();
        navigate("/");
      } catch (error) {
        console.error("Login failed now", error);
        setErrors({
          password:
            "Login failed. Please check your credentials and try again.",
        });
      }
    }
  };

  // const handleForgotPassword = () => {
  //   navigate("/reset-password");
  // };

  // const handleSignUp = () => {
  //   navigate("/signup");
  // };

  // if (loading) return <FullScreenLoader />;

  return (
    <div className="h-dvh flex items-center justify-center bg-gray-50 back-gradient-login">
      {loading && <FullScreenLoader />}
      <form
        onSubmit={handleSubmit}
        className="max-w-[400px] border border-gray-300 rounded-xl shadow-md bg-white flex flex-col gap-4 p-6 w-full mx-4"
      >
        <div className="flex justify-center mb-4">
          <img src="/logo1.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <div className="w-full flex justify-center text-2xl font-semibold mb-4 text-gray-700">
          Welcome Admin
        </div>
        <div>
          <Text>
            Username<Text type="danger">*</Text>
          </Text>
          <Input
            ref={userNameRef}
            size="large"
            name="userName"
            placeholder="Enter registered Email/Mobile Number"
            value={login?.userName}
            onChange={handleLogin}
            onKeyDown={(e) => handleKeyDown(e, "userName")}
          />
          {errors?.userName && (
            <div className="text-red-500 text-xs pt-1.5">
              {errors?.userName}
            </div>
          )}
        </div>
        <div>
          <Text>
            Password<Text type="danger">*</Text>
          </Text>
          <Input.Password
            ref={passwordRef}
            size="large"
            name="password"
            placeholder="Enter Password"
            value={login?.password}
            onChange={handleLogin}
            onKeyDown={(e) => handleKeyDown(e, "password")}
          />
          {errors?.password && (
            <div className="text-red-500 text-xs pt-1.5">
              {errors?.password}
            </div>
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
            loading={loading}
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
          <div className="w-full justify-center flex text-xs text-gray-400 mt-4">
            © 2025 vdrive. All rights reserved.
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
