import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography,Flex } from "antd";
import '../signup/signupStyle.css'

const { Text } = Typography;

export interface Login{
    userName:string,
    password:string
}
const Login =()=>{
    const navigate= useNavigate();
 const [login,setLogin]=useState<Login>({
    userName:"",
    password:""
 });
 const [errors, setErrors] = useState<Record<string, string>>({});

 const handleLogin =(evt: React.ChangeEvent<HTMLInputElement>)=>{
    const {name,value} =evt?.target;
    setLogin((prev)=>({
        ...prev,
        [name]:value
    }))
 }

 const validate =()=>{
    let newErrors: Record<string, string> = {};
    if (!login?.userName) {
        
        newErrors.userName = "Registered Email/Mobile Number is required";
 }
 if(!login?.password){
    newErrors.password ="Password is required"
 }
 setErrors(newErrors);
 return Object.keys(newErrors)?.length === 0;
}

 const handleSubmit =()=>{
    if (validate()) {
     console.log("Login successful");
     navigate('/')
    }
 }

 const handleForgotPassword =()=>{
    navigate('/')
 }

 const handleSignUp =()=>{
    navigate('/signup')
 }

 return (
   <div className="signup-container">
     <div>
       <Text strong>UserName<Text className="mandatory">*</Text></Text>
       <Input
         name="userName"
         placeholder="Enter registered Email/Mobile Number"
         value={login?.userName}
         onChange={handleLogin}
       />
        {errors?.userName && (
          <div className ="err-msg">{errors?.userName}</div>
        )}
     </div>
     <div>
       <Text strong>Password<Text className="mandatory">*</Text></Text>
       <Input.Password
         name="password"
         placeholder="Enter Password"
         value={login?.password}
         onChange={handleLogin}
       />
        {errors?.password && (
          <div className ="err-msg">{errors?.password}</div>
        )}
     </div>
        <Button type="link" block onClick={handleForgotPassword} style={{display:"flex",justifyContent:"flex-end"}}>Forgot password?</Button>
    <div className="button-container">

  
    <Button
        type="primary"
        block
        onClick={handleSubmit}
        style={{ marginTop: 16,width:75 }}
      >
        Login
      </Button>
      <div>
        <Text>Or Sign Up using
       <Text> <Button  
        type="link"
        block
        onClick={handleSignUp}
        style={{width:75}}
        >
        Sign Up
        </Button></Text></Text> </div>
        </div>
   </div>
 );

}

export default Login;