import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "antd";


const { Text } = Typography;

export interface Login {
  userName: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
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

  const handleSubmit = () => {
    if (validate()) {
      try{
        
        navigate("/");
      }catch(error){

      }
      
    }
  };

  const handleForgotPassword = () => {
    navigate("/reset-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="max-w-[480px] w-full border border-gray-200 rounded-2xl shadow-sm bg-white p-10 mt-20 mx-auto">
      <div className="flex flex-col text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          V Drive
        </h1>
        <h3 className="tracking-tight text-2xl font-bold">Welcome Back</h3>
        <p className="text-sm text-gray-500">Sign in to your admin account</p>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <label className="font-bold text-sm">
            Username<span className="text-red-500">*</span>
          </label>
          <Input
            size="large"
            name="userName"
            placeholder="Enter registered Email/Mobile Number"
            value={login?.userName}
            onChange={handleLogin}
          />
          {errors?.userName && (
            <div className="text-red-500 text-xs pt-1.5">
              {errors?.userName}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-2">
          <label className="font-bold text-sm">
            Password<span className="text-red-500">*</span>
          </label>
          <Input.Password
            size="large"
            name="password"
            placeholder="Enter your password"
            value={login?.password}
            onChange={handleLogin}
          />
          {errors?.password && (
            <div className="text-red-500 text-xs pt-1.5">
              {errors?.password}
            </div>
          )}
        </div>

        <div className="flex justify-end ">
          <Button type="link" className="p-0" onClick={handleForgotPassword}>
            Forgot password?
          </Button>
        </div>

        <Button
          type="primary"
          block
          size="large"
          className="!bg-blue-600 hover:!bg-blue-700"
          onClick={handleSubmit}
        >
          Sign In
        </Button>
      </div>
      <div className="text-center mt-6 text-sm">
        <Text className="text-gray-500">Don't have an account? </Text>
        <Button
          type="link"
          className="p-0 text-blue-600 font-medium"
          onClick={handleSignUp}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default Login;
